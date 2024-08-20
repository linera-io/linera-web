/**
This module defines the client API for the Web extension.

Exported (marked with `#[wasm_bindgen]`) functions will be callable from the extension frontend.

Exported functions prefixed with `dapp_` _will additionally be
callable from all Web pages to which the Web client has been
connected_.  Outside of their type, which is checked at call time,
arguments to these functions cannot be trusted and _must_ be verified!
*/

use linera_core::node::{
    LocalValidatorNode as _,
    LocalValidatorNodeProvider as _,
};

use wasm_bindgen::prelude::*;
use web_sys::*;

use linera_client::{chain_listener::ClientContext as _, client_options::ClientOptions, wallet::Wallet};

use std::{collections::HashMap, sync::Arc};
use futures::lock::Mutex as AsyncMutex;

// TODO convert to IndexedDbStore once we refactor Context
type WebStorage = linera_storage::DbStorage<
    linera_views::memory::MemoryStore,
    linera_storage::WallClock,
>;

pub async fn get_storage() -> Result<WebStorage, <WebStorage as linera_storage::Storage>::StoreError> {
    linera_storage::DbStorage::new(
        linera_views::memory::MemoryStoreConfig::new(1),
        "linera",
        None,
    ).await
}


type PersistentWallet = linera_client::persistent::LocalStorage<Wallet>;
type ClientContext = linera_client::client_context::ClientContext<WebStorage, PersistentWallet>;

// TODO get from config
pub const OPTIONS: ClientOptions = ClientOptions {
    send_timeout: std::time::Duration::from_millis(4000),
    recv_timeout: std::time::Duration::from_millis(4000),
    max_pending_messages: 10,
    wasm_runtime: None,
    max_concurrent_queries: None,
    max_stream_queries: 10,
    cache_size: 1000,
    notification_retry_delay: std::time::Duration::from_millis(1000),
    notification_retries: 10,
    wait_for_outgoing_messages: false,
    message_policy: linera_core::client::MessagePolicy::Accept,

    // TODO: separate these out from the `ClientOptions` struct, since
    // the apply only to the CLI/native client
    tokio_threads: Some(1),
    command: linera_client::client_options::ClientCommand::Keygen,
    wallet_state_path: None,
    storage_config: None,
    with_wallet: None,
};

/// The full client API, exposed to the wallet implementation.  Calls
/// to this API can be trusted to have originated from the user's
/// request.
#[wasm_bindgen]
pub struct Client(
    // This use of `futures::lock::Mutex` is safe because we only
    // expose concurrency to the browser, which must always run all
    // futures on the global task queue.
    Arc<AsyncMutex<ClientContext>>,
);

/// The subset of the client API that should be exposed to application
/// frontends.  The API here is directly exposed to random Web pages
/// on the Internet, and so calls should not be trusted.
#[wasm_bindgen]
pub struct Frontend(Arc<AsyncMutex<ClientContext>>);

#[wasm_bindgen]
impl Client {
    #[wasm_bindgen(constructor)]
    pub async fn new() -> Result<Client, JsError> {
        let wallet = linera_client::config::WalletState::read_from_local_storage("linera-wallet")?;
        let mut storage = get_storage().await?;
        wallet.genesis_config().initialize_storage(&mut storage).await?;
        let storage = get_storage().await?;
        log::info!("Linera Web client successfully initialized");
        Ok(Self(Arc::new(futures::lock::Mutex::new(ClientContext::new(storage, OPTIONS, wallet)))))
    }

    #[wasm_bindgen]
    pub fn frontend(&self) -> Frontend {
        Frontend(self.0.clone())
    }
}

#[wasm_bindgen]
impl Frontend {
    #[wasm_bindgen]
    pub async fn validator_version_info(&self) -> Result<JsValue, JsError> {
        let mut client_context = self.0.lock().await;
        let chain_id = client_context.wallet().default_chain().expect("No default chain");
        let mut chain_client = client_context.make_chain_client(chain_id);

        log::info!(
            "Querying the validators of the current epoch of chain {}",
            chain_id
        );
        chain_client.synchronize_from_validators().await?;
        log::info!("Synchronized state from validators");
        let result = chain_client.local_committee().await;
        client_context.update_and_save_wallet(&mut chain_client).await;
        let committee = result?;
        log::info!("{:?}", committee.validators());
        let node_provider = client_context.make_node_provider();

        let mut validator_versions = HashMap::new();

        for (name, state) in committee.validators() {
            match node_provider
                .make_node(&state.network_address)?
                .get_version_info()
                .await
            {
                Ok(version_info) => if validator_versions.insert(name, version_info).is_some() {
                    log::warn!("duplicate validator entry for validator {name:?}");
                }
                Err(e) => {
                    log::warn!("failed to get version information for validator {name:?}:\n{e:?}")
                }
            }
        }

        Ok(serde_wasm_bindgen::to_value(&validator_versions)?)
    }
}

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    console_log::init_with_level(log::Level::Debug).unwrap();

    log::info!("Linera Web client loaded");
}
