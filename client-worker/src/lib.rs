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

use std::sync::RwLock;

use linera_client::{chain_listener::ClientContext as _, client_options::ClientOptions, wallet::Wallet};

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
    wallet_state_path: None,
    storage_config: None,
    with_wallet: None,

    // Timeout for sending queries (milliseconds)
    send_timeout: std::time::Duration::from_millis(4000),
    recv_timeout: std::time::Duration::from_millis(4000),
    max_pending_messages: 10,

    // The WebAssembly runtime to use.
    wasm_runtime: None,

    // The maximal number of simultaneous queries to the database
    max_concurrent_queries: None,

    // The maximal number of simultaneous stream queries to the database
    max_stream_queries: 10,

    // The maximal number of entries in the storage cache.
    cache_size: 1000,

    // Delay increment for retrying to connect to a validator for notifications.
    notification_retry_delay: std::time::Duration::from_millis(1000),

    // Number of times to retry connecting to a validator for notifications.
    notification_retries: 10,

    // Whether to wait until a quorum of validators has confirmed that all sent cross-chain
    // messages have been delivered.
    wait_for_outgoing_messages: false,

    // The policy for handling incoming messages.
    message_policy: linera_core::client::MessagePolicy::Accept,

    // A dummy command, for now
    command: linera_client::client_options::ClientCommand::Keygen,

    tokio_threads: Some(1),
};

pub async fn get_client_context(wallet: &Wallet) -> Result<ClientContext, JsError> {
    let mut storage = get_storage().await?;
    wallet.genesis_config().initialize_storage(&mut storage).await?;
    Ok(ClientContext::new(get_storage().await?, OPTIONS, OPTIONS.wallet()?))
}

#[wasm_bindgen]
pub async fn dapp_query_validators() -> Result<(), JsError> {
    let wallet = WALLET.read()?;
    let wallet = wallet.as_ref().ok_or(JsError::new("no wallet set"))?;

    let mut storage = get_storage().await?;

    wallet.genesis_config().initialize_storage(&mut storage).await?;

    let chain_id = wallet.default_chain().expect("No default chain");

    let mut client_context: ClientContext = get_client_context(wallet).await?;

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
    for (name, state) in committee.validators() {
        match node_provider
            .make_node(&state.network_address)?
            .get_version_info()
            .await
        {
            Ok(version_info) => {
                log::info!(
                    "Version information for validator {name:?}:{}",
                    version_info
                );
            }
            Err(e) => {
                log::warn!("Failed to get version information for validator {name:?}:\n{e}")
            }
        }
    }

    Ok(())
}

static WALLET: RwLock<Option<Wallet>> = RwLock::new(None);

#[wasm_bindgen]
pub async fn set_wallet(wallet: &str) -> Result<(), wasm_bindgen::JsError> {
    *WALLET.write()? = serde_json::from_str(wallet)?;
    Ok(())
}

#[wasm_bindgen]
pub async fn dapp_query(n: u32) -> u32 {
    n + 1
}

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    console_log::init_with_level(log::Level::Debug).unwrap();

    log::info!("Hello World!");
}
