function respond(id, message) {
    window.dispatchEvent(new CustomEvent("linera-wallet-response", {
        detail: { id, message },
    }))
}

window.addEventListener("linera-wallet-request", async e =>
    respond(e.detail.id, await chrome.runtime.sendMessage(e.detail.message)));

window.dispatchEvent(new Event("linera-wallet-loaded"));
