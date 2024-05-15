type RequestEvent = CustomEvent<{id: unknown; message: unknown;}>;

function respond(id: unknown, message: unknown) {
    window.dispatchEvent(new CustomEvent("linera-wallet-response", {
        detail: { id, message },
    }))
}

window.addEventListener("linera-wallet-request", async e => {
  const event = e as RequestEvent;
  respond(event.detail.id, await chrome.runtime.sendMessage(event.detail.message))
});

window.dispatchEvent(new Event("linera-wallet-loaded"));
