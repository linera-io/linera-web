const state = {
  creatingDocument: null as Promise<void> | null
};

export async function setup() {
  try {
    const offscreenUrl = chrome.runtime.getURL('src/service-worker/offscreen/index.html');
    console.log(`Creating offscreen document with URL: ${offscreenUrl}`);

    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [offscreenUrl]
    });

    if (existingContexts.length > 0) {
      console.log(`Found existing offscreen document: ${existingContexts.length}`);
      return;
    }

    if (!state.creatingDocument) {
      console.log('No existing offscreen document found, creating a new one.');
      state.creatingDocument = chrome.offscreen.createDocument({
        url: offscreenUrl,
        reasons: ['WORKERS' as unknown as chrome.offscreen.Reason],
        justification: 'to run heavy work in the background',
      });
    }

    console.log('Awaiting document creation...');
    await state.creatingDocument;
    console.log('Document created successfully.');
    state.creatingDocument = null;
  } catch (error) {
    console.error('Error while creating offscreen document:', error);
  }
}

export async function server() {
  try {
    await wallet.Server.run();
  } catch (error) {
    console.error('Error in server execution:', error);
  }
}
