let creating: Promise<void> | null; // A global promise to avoid concurrency issues

export async function setup() {
  // TODO this is a bit of a hack: I'd like to import the URL of the
  // processed HTML instead of making it a root
  const offscreenUrl = chrome.runtime.getURL('src/service-web-worker/offscreen/index.html');

  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT' as unknown as chrome.runtime.ContextType],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (!creating)
    creating = chrome.offscreen.createDocument({
      url: offscreenUrl,
      reasons: ['WORKERS' as unknown as chrome.offscreen.Reason],
      justification: 'to run heavy work in the background',
    });

  await creating;
  creating = null;
}
