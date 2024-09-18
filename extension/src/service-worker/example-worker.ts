onmessage = (e: MessageEvent) => {
  postMessage(['output', e.data]);
}
