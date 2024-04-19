import init from './linera_web.js';
import * as wasm from './linera_web.js';

const runtime = chrome.runtime || browser.runtime;

(async () => {
    await init(runtime.getURL('linera_web_bg.wasm'));
    runtime.onMessage.addListener((message, _sender, respond) => {
        wasm[message.function].call(null, message.arguments).then(respond);
        return true;
    });
})();
