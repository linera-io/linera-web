use linera_base::{
    identifiers::ChainId,
};
use linera_core::{
    client::ArcChainClient,
};

use wasm_bindgen::prelude::*;
use web_sys::*;
#[macro_use]
mod util;

#[wasm_bindgen]
pub async fn query(n: u32) -> u32 {
    n + 1
}

#[wasm_bindgen(start)]
pub async fn main() {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));

    log!("Hello World!");
}
