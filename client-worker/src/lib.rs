/**
This module defines the client API for the Web extension.

Exported (marked with `#[wasm_bindgen]`) functions will be callable from the extension frontend.

Exported functions prefixed with `dapp_` _will additionally be
callable from all Web pages to which the Web client has been
connected_.  Outside of their type, which is checked at call time,
arguments to these functions cannot be trusted and _must_ be verified!
*/

use linera_base::{
    crypto::{CryptoRng, CryptoHash, KeyPair, PublicKey},
    data_types::{Amount, BlockHeight, Timestamp},
    identifiers::{
        ChainDescription,
        ChainId,
    },
};
use linera_core::{
    client::{ArcChainClient, ChainClient, ChainClientBuilder},
    node::{
        LocalValidatorNode as _,
        LocalValidatorNodeProvider as _,
    },
};
use linera_rpc::node_provider::{NodeOptions, NodeProvider};

use wasm_bindgen::prelude::*;
use web_sys::*;

use std::collections::{BTreeMap, HashMap};
use std::sync::RwLock;
use std::time::Duration;

mod config;
mod options;
mod wallet;

use options::ClientOptions;
use wallet::Wallet;

type ChainClients<P, S> = std::collections::BTreeMap<ChainId, ArcChainClient<P, S>>;

// TODO convert to IndexedDbStore once we refactor Context
type WebStorage = linera_storage::DbStorage<
    linera_views::memory::MemoryStore,
    linera_storage::WallClock,
>;

pub async fn get_storage() -> Result<WebStorage, <WebStorage as linera_storage::Storage>::ContextError> {
    linera_storage::DbStorage::new(
        linera_views::memory::MemoryStoreConfig::new(1),
        "linera",
        None,
    ).await
}

pub struct ClientContext {
    wallet_state: WalletState,
    chain_client_builder: ChainClientBuilder<NodeProvider>,
    send_timeout: Duration,
    recv_timeout: Duration,
    notification_retry_delay: Duration,
    notification_retries: u32,
    prng: Box<dyn CryptoRng>,
}

impl ClientContext {
    fn wallet_state(&self) -> &WalletState {
        &self.wallet_state
    }

    fn make_chain_client<S>(&self, storage: S, chain_id: ChainId) -> ChainClient<NodeProvider, S> {
        let chain = self
            .wallet_state.0
            .get(chain_id)
            .unwrap_or_else(|| panic!("Unknown chain: {}", chain_id));
        let known_key_pairs = chain
            .key_pair
            .as_ref()
            .map(|kp| kp.copy())
            .into_iter()
            .collect();
        self.chain_client_builder.build(
            chain_id,
            known_key_pairs,
            storage,
            self.wallet_state.0.genesis_admin_chain(),
            chain.block_hash,
            chain.timestamp,
            chain.next_block_height,
            chain.pending_block.clone(),
        )
    }

    fn update_wallet_for_new_chain(
        &mut self,
        chain_id: ChainId,
        key_pair: Option<KeyPair>,
        timestamp: Timestamp,
    ) {
        if self.wallet_state.0.get(chain_id).is_none() {
            self.wallet_state.0.insert(wallet::UserChain {
                chain_id,
                key_pair: key_pair.as_ref().map(|kp| kp.copy()),
                block_hash: None,
                timestamp,
                next_block_height: BlockHeight::ZERO,
                pending_block: None,
            });
        }
    }

    pub async fn update_and_save_wallet<'a, S>(&mut self, state: &mut ChainClient<NodeProvider, S>)
    where
        S: linera_storage::Storage + Clone + Send + Sync + 'static,
        linera_views::views::ViewError: From<S::ContextError>,
    {
        self.wallet_state.0.update_from_state(state).await;
        self.wallet_state.0.refresh_prng_seed(&mut self.prng);
        self.wallet_state.write();
    }




    pub fn make_node_provider(&self) -> NodeProvider {
        NodeProvider::new(self.make_node_options())
    }

    fn make_node_options(&self) -> NodeOptions {
        NodeOptions {
            send_timeout: self.send_timeout,
            recv_timeout: self.recv_timeout,
            notification_retry_delay: self.notification_retry_delay,
            notification_retries: self.notification_retries,
        }
    }
}

pub async fn get_client_context(wallet: &Wallet) -> Result<ClientContext, JsError> {
    // TODO get from config
    let options: ClientOptions = options::OPTIONS;

    Ok(ClientContext {
        prng: wallet.make_prng(),
        wallet_state: WalletState(wallet.copy()),
        chain_client_builder: ChainClientBuilder::new(
            NodeProvider::new(NodeOptions {
                send_timeout: options.send_timeout,
                recv_timeout: options.recv_timeout,
                notification_retry_delay: options.notification_retry_delay,
                notification_retries: options.notification_retries,
            }),
            options.max_pending_messages,
            linera_core::node::CrossChainMessageDelivery::new(true),
        ),
        send_timeout: options.send_timeout,
        recv_timeout: options.recv_timeout,
        notification_retry_delay: options.notification_retry_delay,
        notification_retries: options.notification_retries,
    })
}

struct WalletState(Wallet);

impl WalletState {
    fn refresh_prng_seed(&mut self) {
        // TODO
    }

    fn write(&self) {
        // TODO
    }
}

#[wasm_bindgen]
pub async fn dapp_query_validators() -> Result<(), JsError> {
    let wallet = WALLET.read()?;
    let wallet = wallet.as_ref().ok_or(JsError::new("no wallet set"))?;

    let mut storage = get_storage().await?;

    wallet.genesis_config().initialize_storage(&mut storage).await?;

    let chain_id = wallet.default_chain().expect("No default chain");

    let mut client_context: ClientContext = get_client_context(wallet).await?;

    let mut chain_client = client_context.make_chain_client(storage, chain_id);
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

    console_log::init_with_level(log::Level::Debug);

    log::info!("Hello World!");
}
