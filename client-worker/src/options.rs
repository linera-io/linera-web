// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use std::{env, iter, num::NonZeroU16, path::PathBuf, time::Duration};

use anyhow::Error;
use chrono::{DateTime, Utc};
use linera_base::{
    crypto::PublicKey,
    data_types::{Amount, TimeDelta},
    identifiers::{Account, ApplicationId, BytecodeId, ChainId, MessageId, Owner},
    ownership::{ChainOwnership, TimeoutConfig},
};
use linera_core::client::MessagePolicy;
use linera_execution::{
    committee::ValidatorName, system::SystemChannel, UserApplicationId, WasmRuntime,
    WithWasmDefault,
};
use linera_views::common::CommonStoreConfig;

pub struct ClientOptions {
    /// Sets the file storing the private state of user chains (an empty one will be created if missing)
    pub wallet_state_path: Option<PathBuf>,

    /// Storage configuration for the blockchain history.
    pub storage_config: Option<String>,

    /// Given an integer value N, read the wallet state and the wallet storage config from the
    /// environment variables LINERA_WALLET_{N} and LINERA_STORAGE_{N} instead of
    /// LINERA_WALLET and LINERA_STORAGE.
    pub with_wallet: Option<u32>,

    /// Timeout for sending queries (milliseconds)
    pub send_timeout: Duration,

    /// Timeout for receiving responses (milliseconds)
    pub recv_timeout: Duration,

    pub max_pending_messages: usize,

    /// The WebAssembly runtime to use.
    pub wasm_runtime: Option<WasmRuntime>,

    /// The maximal number of simultaneous queries to the database
    pub max_concurrent_queries: Option<usize>,

    /// The maximal number of simultaneous stream queries to the database
    pub max_stream_queries: usize,

    /// The maximal number of entries in the storage cache.
    pub cache_size: usize,

    /// Delay increment for retrying to connect to a validator for notifications.
    pub notification_retry_delay: Duration,

    /// Number of times to retry connecting to a validator for notifications.
    pub notification_retries: u32,

    /// Whether to wait until a quorum of validators has confirmed that all sent cross-chain
    /// messages have been delivered.
    pub wait_for_outgoing_messages: bool,

    /// The policy for handling incoming messages.
    pub message_policy: MessagePolicy,
}

pub const OPTIONS: ClientOptions = ClientOptions {
    wallet_state_path: None,
    storage_config: None,
    with_wallet: None,

    /// Timeout for sending queries (milliseconds)
    send_timeout: std::time::Duration::from_millis(4000),
    recv_timeout: std::time::Duration::from_millis(4000),
    max_pending_messages: 10,

    /// The WebAssembly runtime to use.
    wasm_runtime: None,

    /// The maximal number of simultaneous queries to the database
    max_concurrent_queries: None,

    /// The maximal number of simultaneous stream queries to the database
    max_stream_queries: 10,

    /// The maximal number of entries in the storage cache.
    cache_size: 1000,

    /// Delay increment for retrying to connect to a validator for notifications.
    notification_retry_delay: std::time::Duration::from_millis(1000),

    /// Number of times to retry connecting to a validator for notifications.
    notification_retries: 10,

    /// Whether to wait until a quorum of validators has confirmed that all sent cross-chain
    /// messages have been delivered.
    wait_for_outgoing_messages: false,

    /// The policy for handling incoming messages.
    message_policy: MessagePolicy::Accept,
};
