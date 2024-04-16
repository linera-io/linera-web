let Linera = {
    loaded: new Promise(resolve => {
        const listener = window.addEventListener("linera-wallet-load", () => {
            resolve();
            window.removeEventListener("linera-wallet-load", listener);
        });
        return false;
    }),
    sendRequest: (() => request => {
        let nextMessageId = 0;
        let responses = new Map();

        return new Promise(resolve => {
            responses.set(nextMessageId, resolve);
            window.dispatchEvent(new CustomEvent(
                "linera-wallet-request",
                {
                    detail: {
                        id: nextMessageId,
                        message: request,
                    },
                },
            ));
        });
    })(),
};

window.addEventListener("linera-wallet-response", e => {
    Linera.responses.get(e.detail.id)?.(e.detail.message);
    return false;
});
