/* TODO make this conform to https://github.com/wallet-standard/wallet-standard/ */

type RequestEvent = CustomEvent<{id: unknown; message: unknown;}>;

function respond(id: unknown, message: unknown) {
    window.dispatchEvent(new CustomEvent('linera-wallet-response', {
        detail: { id, message },
    }))
}

window.addEventListener('linera-wallet-request', async e => {
  const event = e as RequestEvent;
  console.log('Got wallet request', event.detail);
  const response = await chrome.runtime.sendMessage(event.detail.message);
  console.log('Got wallet response', response);
  respond(event.detail.id, response);
});

window.dispatchEvent(new Event('linera-wallet-loaded'));
