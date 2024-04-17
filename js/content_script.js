function respond(event, response) {
    window.dispatchEvent(new CustomEvent("linera-wallet-response", {
        detail: {
            id: event.detail.id,
            message: response,
        }
    }))
}

window.addEventListener("linera-wallet-request", e => {
    console.log("got request", e.detail);
    respond(e, "Hi!");
});

window.dispatchEvent(new Event("linera-wallet-load"));
