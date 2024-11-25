import * as wallet from '@/wallet';

let creating: Promise<void> | null; // A global promise to avoid concurrency issues

export async function setup() {
  console.log('Creating offscreen document');
  // This is a bit of a hack: I'd like to import the URL of the
  // processed HTML instead of making it a root, but I can't find a
  // way to do so in Vite.
  const offscreenUrl = chrome.runtime.getURL('src/service-worker/offscreen/index.html');

  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT' as unknown as chrome.runtime.ContextType],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    console.log('Found existing offscreen document');
    return;
  }

  if (!creating)
    creating = chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: ['WORKERS' as unknown as chrome.offscreen.Reason],
      justification: 'to run heavy work in the background',
    });

  console.log('Awaiting document creation');

  await creating;

  console.log('Document created');
  creating = null;
}

export async function server() {
  wallet.Server.run();
}
