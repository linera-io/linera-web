/*!
This module defines the client API for the Web extension.

Exported (marked with `#[wasm_bindgen]`) functions will be callable from the extension frontend.

Exported functions prefixed with `dapp_` _will additionally be
callable from all Web pages to which the Web client has been
connected_.  Outside of their type, which is checked at call time,
arguments to these functions cannot be trusted and _must_ be verified!
*/

use linera_core::{
    data_types::ClientOutcome,
    node::{
        ValidatorNode as _,
        ValidatorNodeProvider as _,
    },
};

use std::future::Future;

use serde::ser::Serialize as _;

use wasm_bindgen::prelude::*;
use web_sys::*;

use linera_base::identifiers::{ApplicationId, ChainId};
use linera_client::{chain_listener::{ChainListener, ChainListenerConfig, ClientContext as _}, client_options::ClientOptions, wallet::Wallet};

use std::{collections::HashMap, sync::Arc};
use futures::lock::Mutex as AsyncMutex;

use linera_views::store::WithError;

// TODO convert to IndexedDbStore once we refactor Context
type WebStorage = linera_storage::DbStorage<
    linera_views::memory::MemoryStore,
    linera_storage::WallClock,
>;

pub async fn get_storage() -> Result<WebStorage, <linera_views::memory::MemoryStore as WithError>::Error> {
    linera_storage::DbStorage::initialize(
        linera_views::memory::MemoryStoreConfig::new(1),
        "linera",
        b"",
        Some(linera_execution::WasmRuntime::Wasmer),
    ).await
}


type PersistentWallet = linera_client::persistent::Memory<Wallet>;
type ClientContext = linera_client::client_context::ClientContext<WebStorage, PersistentWallet>;
type ChainClient = linera_core::client::ChainClient<linera_rpc::node_provider::NodeProvider, WebStorage>;

// TODO(#13): get from user
pub const OPTIONS: ClientOptions = ClientOptions {
    send_timeout: std::time::Duration::from_millis(4000),
    recv_timeout: std::time::Duration::from_millis(4000),
    max_pending_message_bundles: 10,
    wasm_runtime: Some(linera_execution::WasmRuntime::Wasmer),
    max_concurrent_queries: None,
    max_loaded_chains: nonzero_lit::usize!(40),
    max_stream_queries: 10,
    cache_size: 1000,
    retry_delay: std::time::Duration::from_millis(1000),
    max_retries: 10,
    wait_for_outgoing_messages: false,
    blanket_message_policy: linera_core::client::BlanketMessagePolicy::Accept,
    restrict_chain_ids_to: None,
    long_lived_services: false,

    // TODO(linera-protocol#2944): separate these out from the
    // `ClientOptions` struct, since they apply only to the CLI/native
    // client
    tokio_threads: Some(1),
    command: linera_client::client_options::ClientCommand::Keygen,
    wallet_state_path: None,
    storage_config: None,
    with_wallet: None,
};

#[wasm_bindgen(js_name = Wallet)]
pub struct JsWallet(PersistentWallet);

#[wasm_bindgen(js_class = "Wallet")]
impl JsWallet {
    #[wasm_bindgen]
    pub async fn create(wallet: &str) -> Result<JsWallet, JsError> {
        Ok(JsWallet(PersistentWallet::new(serde_json::from_str(wallet)?)))
    }

    #[wasm_bindgen]
    pub async fn read() -> Result<Option<JsWallet>, JsError> {
        Ok(None)
    }
}

/// The full client API, exposed to the wallet implementation.  Calls
/// to this API can be trusted to have originated from the user's
/// request.
#[wasm_bindgen]
#[derive(Clone)]
pub struct Client {
    // This use of `futures::lock::Mutex` is safe because we only
    // expose concurrency to the browser, which must always run all
    // futures on the global task queue.
    client_context: Arc<AsyncMutex<ClientContext>>,
}

/// The subset of the client API that should be exposed to application
/// frontends.  The API here is directly exposed to random Web pages
/// on the Internet, and so calls should not be trusted.
#[wasm_bindgen]
pub struct Frontend(Client);

#[wasm_bindgen]
impl Client {
    /// Applies the given function to the chain client.
    /// Updates the wallet regardless of the outcome. As long as the function returns a round
    /// timeout, it will wait and retry.
    async fn apply_client_command<Fut, T>(
        &self,
        chain_id: ChainId,
        mut f: impl FnMut(&mut ChainClient) -> Fut,
    ) -> Result<T, JsError>
    where
        Fut: Future<Output = Result<ClientOutcome<T>, JsError>>,
    {
        loop {
            let mut chain_client = self.client_context.lock().await.make_chain_client(chain_id)?;
            let mut stream = chain_client.subscribe().await?;
            let result = f(&mut chain_client).await;
            self.client_context.lock().await.update_wallet(&chain_client).await?;
            let timeout = match result? {
                ClientOutcome::Committed(t) => return Ok(t),
                ClientOutcome::WaitForTimeout(timeout) => timeout,
            };
            drop(chain_client);
            linera_client::util::wait_for_next_round(&mut stream, timeout).await;
        }
    }

    #[wasm_bindgen(constructor)]
    pub async fn new(wallet: JsWallet) -> Result<Client, JsError> {
        let JsWallet(wallet) = wallet;
        let mut storage = get_storage().await?;
        wallet.genesis_config().initialize_storage(&mut storage).await?;
        let client_context = Arc::new(AsyncMutex::new(ClientContext::new(storage.clone(), OPTIONS, wallet)));
        ChainListener::new(ChainListenerConfig::default())
            .run(client_context.clone(), storage)
            .await;
        log::info!("Linera Web client successfully initialized");
        Ok(Self {
            client_context,
        })
    }

    #[wasm_bindgen]
    pub fn frontend(&self) -> Frontend {
        Frontend(self.clone())
    }
}

// A serializer suitable for serializing responses to JavaScript to be
// sent using `postMessage`.
static RESPONSE_SERIALIZER: serde_wasm_bindgen::Serializer =
    serde_wasm_bindgen::Serializer::new()
        .serialize_large_number_types_as_bigints(true)
        .serialize_maps_as_objects(true);

#[wasm_bindgen]
impl Frontend {
    #[wasm_bindgen]
    pub async fn validator_version_info(&self) -> Result<JsValue, JsError> {
        let mut client_context = self.0.client_context.lock().await;
        let chain_id = client_context.wallet().default_chain().expect("No default chain");
        let chain_client = self.0.client_context.lock().await.make_chain_client(chain_id)?;
        chain_client.synchronize_from_validators().await?;
        let result = chain_client.local_committee().await;
        client_context.update_and_save_wallet(&chain_client).await?;
        let committee = result?;
        let node_provider = client_context.make_node_provider();

        let mut validator_versions = HashMap::new();

        for (name, state) in committee.validators() {
            match node_provider
                .make_node(&state.network_address)?
                .get_version_info()
                .await
            {
                Ok(version_info) => if validator_versions.insert(name, version_info.clone()).is_some() {
                    log::warn!("duplicate validator entry for validator {name:?}");
                }
                Err(e) => {
                    log::warn!("failed to get version information for validator {name:?}:\n{e:?}")
                }
            }
        }

        Ok(validator_versions.serialize(&RESPONSE_SERIALIZER)?)
    }

    #[wasm_bindgen]
    // TODO use bytes here not strings
    pub async fn query_application(&self, application_id: JsValue, query: &str) -> Result<String, JsError> {
        let chain_id = self.0.client_context.lock().await.wallet().default_chain().expect("there should be a default chain");
        let application_id = serde_wasm_bindgen::from_value(application_id)?;
        let chain_client = self.0.client_context.lock().await.make_chain_client(chain_id)?;
        let response = chain_client.query_application(linera_execution::Query::User {
            application_id,
            bytes: query.as_bytes().to_vec(),
        }).await?;
        let linera_execution::Response::User(response) = response else {
            panic!("system response to user query")
        };
        Ok(String::from_utf8(response)?)
    }
}

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    linera_base::tracing::init();
}
