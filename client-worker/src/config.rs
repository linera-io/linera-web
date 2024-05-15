// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

use std::{
    io::{BufRead, BufReader, BufWriter, Write},
    path::{Path, PathBuf},
};

use anyhow::{bail, Context as _};
use linera_base::{
    crypto::{BcsSignable, KeyPair, PublicKey},
    data_types::{Amount, Timestamp},
    identifiers::{ChainDescription, ChainId},
};
use linera_execution::{
    committee::{Committee, ValidatorName, ValidatorState},
    ResourceControlPolicy,
};
use linera_rpc::config::{ValidatorInternalNetworkConfig, ValidatorPublicNetworkConfig};
use linera_storage::Storage;
use linera_views::views::ViewError;
use serde::{de::DeserializeOwned, Deserialize, Serialize};

use wasm_bindgen::JsError;

use crate::wallet::Wallet;

pub trait Import: DeserializeOwned {
    fn read(path: &Path) -> Result<Self, std::io::Error> {
        unimplemented!()
    }
}

pub trait Export: Serialize {
    fn write(&self, path: &Path) -> Result<(), std::io::Error> {
        unimplemented!()
    }
}

/// The public configuration of a validator.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ValidatorConfig {
    /// The public key of the validator.
    pub name: ValidatorName,
    /// The network configuration for the validator.
    pub network: ValidatorPublicNetworkConfig,
}

/// The private configuration of a validator service.
#[derive(Serialize, Deserialize)]
pub struct ValidatorServerConfig {
    pub validator: ValidatorConfig,
    pub key: KeyPair,
    pub internal_network: ValidatorInternalNetworkConfig,
}

impl Import for ValidatorServerConfig {}
impl Export for ValidatorServerConfig {}

/// The (public) configuration for all validators.
#[derive(Debug, Default, Clone, Deserialize, Serialize)]
pub struct CommitteeConfig {
    pub validators: Vec<ValidatorConfig>,
}

impl Import for CommitteeConfig {}
impl Export for CommitteeConfig {}

impl CommitteeConfig {
    pub fn into_committee(self, policy: ResourceControlPolicy) -> Committee {
        let validators = self
            .validators
            .into_iter()
            .map(|v| {
                (
                    v.name,
                    ValidatorState {
                        network_address: v.network.to_string(),
                        votes: 1,
                    },
                )
            })
            .collect();
        Committee::new(validators, policy)
    }
}

pub struct WalletState { inner: Wallet }

impl WalletState {
    pub fn inner(&self) -> &Wallet {
        &self.inner
    }

    pub fn inner_mut(&mut self) -> &mut Wallet {
        &mut self.inner
    }

    pub fn into_inner(self) -> Wallet {
        self.inner
    }

    pub fn create(
        path: &Path,
        genesis_config: GenesisConfig,
        testing_prng_seed: Option<u64>,
    ) -> Result<Self, anyhow::Error> {
        unimplemented!()
    }

    pub fn write(&mut self) -> Result<(), anyhow::Error> {
        unimplemented!();
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GenesisConfig {
    pub committee: CommitteeConfig,
    pub admin_id: ChainId,
    pub timestamp: Timestamp,
    pub chains: Vec<(PublicKey, Amount)>,
    pub policy: ResourceControlPolicy,
    pub network_name: String,
}

impl Import for GenesisConfig {}
impl Export for GenesisConfig {}
impl BcsSignable for GenesisConfig {}

impl GenesisConfig {
    pub fn new(
        committee: CommitteeConfig,
        admin_id: ChainId,
        timestamp: Timestamp,
        policy: ResourceControlPolicy,
        network_name: String,
    ) -> Self {
        Self {
            committee,
            admin_id,
            timestamp,
            chains: Vec::new(),
            policy,
            network_name,
        }
    }

    pub async fn initialize_storage<S>(&self, storage: &mut S) -> Result<(), JsError>
    where
        S: Storage + Clone + Send + Sync + 'static,
        ViewError: From<S::ContextError>,
    {
        let committee = self.create_committee();
        for (chain_number, (public_key, balance)) in (0..).zip(&self.chains) {
            let description = ChainDescription::Root(chain_number);
            storage
                .create_chain(
                    committee.clone(),
                    self.admin_id,
                    description,
                    *public_key,
                    *balance,
                    self.timestamp,
                )
                .await?;
        }
        Ok(())
    }

    pub fn create_committee(&self) -> Committee {
        self.committee.clone().into_committee(self.policy.clone())
    }
}
