import type { MessageListener, ConfirmResponse } from '@/types/message';

import randomstring from 'randomstring';

export async function confirm(question: string): Promise<boolean> {
  const windowId = (await chrome.windows.getCurrent()).id;
  if (windowId === undefined) return false;

  console.log('Confirming:', question);

  // If Vite sees `new URL(<string literal>)` it will replace it with
  // a dynamic URL to the page as an asset.  This would be fine except
  // that the asset version of the page will not be transpiled.  Only
  // the version specified in Vite's `build.rollupOptions.input` gets
  // transpiled.

  const urlString = '/src/popup/confirm/index.html';
  const requestId = randomstring.generate(12);

  let url = new URL(urlString, import.meta.url);
  url.searchParams.set('question', question);
  url.searchParams.set('requestId', requestId);
  chrome.action.setPopup({ popup: url.toString() });

  let response: Promise<boolean> = new Promise(resolve => {
    const listener: MessageListener<ConfirmResponse> = (message, sender, _sendResponse) => {
      if (
        message.type === 'confirm_response'
        && message.requestId === requestId
        && sender.origin === window.location.origin
      ) {
        chrome.runtime.onMessage.removeListener(listener);
        resolve(message.response);
      } else {
        console.log('No', { documentOrigin: window.location.origin, senderOrigin: sender.origin });
      }

      return false;
    };

    chrome.runtime.onMessage.addListener(listener);
  });

  chrome.action.openPopup({ windowId });
  return response;
}
