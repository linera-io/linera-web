import init from './linera_web.js';

const runtime = chrome.runtime || browser.runtime;

(async () => {
    const wasm = await init(runtime.getURL('linera_web_bg.wasm'));
    runtime.onMessage.addListener((message, _sender, respond) =>
        respond(wasm[message.function].call(null, message.arguments)));
})();
