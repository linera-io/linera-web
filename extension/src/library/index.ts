declare global {
    interface WindowEventMap {
      'linera-wallet-loaded': CustomEvent;
      'linera-wallet-request': CustomEvent;
      'linera-wallet-response': CustomEvent;
    }
}

let loaded = new Promise<void>(resolve => {
  window.addEventListener("linera-wallet-response", e => {
    responses.get(e.detail.id)?.(e.detail.message);
    return false;
  });

  function listener() {
    resolve();
    window.removeEventListener("linera-wallet-loaded", listener);
  }

  window.addEventListener("linera-wallet-loaded", listener);
});

let nextMessageId = 0;
let responses = new Map();

export async function sendRequest(request: any): Promise<any> {
  await loaded;

  return await new Promise(resolve => {
    responses.set(nextMessageId, resolve);
    window.dispatchEvent(new CustomEvent(
      "linera-wallet-request",
      {
        detail: {
          id: nextMessageId++,
          message: request,
        },
      },
    ));
  });
}

export async function load(): Promise<void> {
  await loaded;
}

export async function callClientFunction(func: string, ...args: any): Promise<any> {
  return await sendRequest({
    type: 'client_call',
    function: func,
    arguments: args,
  });
}
