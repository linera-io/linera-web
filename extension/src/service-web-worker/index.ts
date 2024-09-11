/**
This module shims `Worker` on service workers by setting up an
offscreen document that manages a pool of Web workers.
 */

import { WorkerId, guards } from './message';
import { isMessage } from '@/message.guard';
import * as offscreen from './offscreen';

export type { WorkerId };

const instances: Map<WorkerId, RemoteWorker> = new Map();

function messageListener(
  message: any,
  _sender: chrome.runtime.MessageSender,
  _respond: () => void
): boolean | undefined {
  if (!isMessage(message) || message.target !== import.meta.url)
    return false;

  if (!guards.isWorkerMessage(message)) {
    console.warn('Unknown message', message);
    return false;
  }

  instances.get(message.worker)!.onmessage?.(message.message);
}

export default class RemoteWorker {
  public onmessage: ((message: MessageEvent) => void) | undefined;
  private id: Promise<WorkerId>;

  private async init(url: string): Promise<WorkerId> {
    if (!chrome.runtime.onMessage.hasListener(messageListener))
      chrome.runtime.onMessage.addListener(messageListener);

    await offscreen.setup();
    const id = await chrome.runtime.sendMessage({
      type: 'new_worker',
      target: import.meta.url,
      url,
    });
    instances.set(id, this);
    return id;
  }

  constructor(url: string) {
    this.id = this.init(url);
  }

  postMessage(message: any) {
    this.id.then(id => {
      chrome.runtime.sendMessage({
        type: 'send_message',
        target: import.meta.url,
        worker: id,
        message,
      })
    });
  }

  terminate() {
    this.id.then(id => {
      chrome.runtime.sendMessage({
        type: 'terminate',
        target: import.meta.url,
        worker: id,
      });
    });
  }
}

export function server() {
  let nextWorkerId = 0;
  const workers = new Map();

  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message.target !== import.meta.url)
      return false;

    if (guards.isNewWorkerRequest(message)) {
      const id = nextWorkerId++;
      const worker = new Worker(message.url);
      console.debug('Worker started');
      worker.onmessage = (e) => {
        chrome.runtime.sendMessage({
          type: 'worker_message',
          target: import.meta.url,
          worker: id,
          message: e.data,
        });
      };
      workers.set(id, worker);
      respond(id);
    } else if (guards.isSendMessageRequest(message)) {
      workers.get(message.worker).postMessage(message.message);
    } else if (guards.isTerminateRequest(message)) {
      workers.get(message.worker).terminate();
    } else
      throw new TypeError('Unknown request: ' + JSON.stringify(message));

    return false;
  });
}
