import wasm_bindgen from "./linera_web.js";

(async () => await wasm_bindgen(
    (chrome.runtime || browser.runtime).getURL('linera_web_bg.wasm')
))();
