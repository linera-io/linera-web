declare global {
    interface WindowEventMap {
      'linera-wallet-loaded': CustomEvent;
      'linera-wallet-request': CustomEvent;
      'linera-wallet-response': CustomEvent;
      'linera-wallet-notification': CustomEvent;
    }
}

const loaded = new Promise<void>(resolve => {
  window.addEventListener("linera-wallet-response", e => {
    responses.get(e.detail.id)?.(e.detail.message);
    return false;
  });

  window.addEventListener('linera-wallet-notification', e => {
    console.log('User library got notification');
    for (const handler of notificationHandlers) {
      handler(e.detail);
    }
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

let notificationHandlers: ((notification: any) => void)[] = [];

export function onNotification(handler: (notification: any) => void) {
  notificationHandlers.push(handler);
}
