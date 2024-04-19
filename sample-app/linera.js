const Linera = (() => {
    let loaded = new Promise(resolve => {
        const listener = window.addEventListener("linera-wallet-loaded", () => {
            resolve();
            window.removeEventListener("linera-wallet-loaded", listener);
        });
    });

    window.addEventListener("linera-wallet-response", e => {
        responses.get(e.detail.id)?.(e.detail.message);
        return false;
    });

    let nextMessageId = 0;
    let responses = new Map();

    return {
        load: async () => await loaded,
        sendRequest: async request => {
            await loaded;

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
        },
    };
})();
