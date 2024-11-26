/* TODO make this conform to https://github.com/wallet-standard/wallet-standard/ */

type RequestEvent = CustomEvent<{id: unknown; message: any;}>;

function respond(id: unknown, message: unknown) {
    window.dispatchEvent(new CustomEvent('linera-wallet-response', {
        detail: { id, message },
    }))
}

window.addEventListener('linera-wallet-request', async e => {
  const event = e as RequestEvent;
  let message = event.detail.message;
  message.target = 'wallet';
  console.debug('Sending message', message);
  const response = await chrome.runtime.sendMessage(message);
  respond(event.detail.id, response);
});

const notifications = chrome.runtime.connect({ name: 'notifications' });
notifications.onMessage.addListener((message: any) => {
  console.debug('content script got notification');
  window.dispatchEvent(new CustomEvent('linera-wallet-notification', {
    detail: message,
  }));
});

window.dispatchEvent(new Event('linera-wallet-loaded'));
