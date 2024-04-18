type RequestEvent = CustomEvent<{id: any; message: any;}>;

function respond(id: any, message: any) {
    window.dispatchEvent(new CustomEvent("linera-wallet-response", {
        detail: { id, message },
    }))
}

window.addEventListener("linera-wallet-request", async e => {
  const event = e as RequestEvent;
  respond(event.detail.id, await chrome.runtime.sendMessage(event.detail.message))
});

window.dispatchEvent(new Event("linera-wallet-loaded"));
