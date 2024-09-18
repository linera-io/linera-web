export * as guards from "./message.guard";

export type WorkerId = number;

// TODO: re-use `Message` and `WorkerId` here once we find a guard
// generation tool that can handle it

export type WorkerRequest = {
  type: string;
  target: string;
  worker: WorkerId;
};

export type NewWorkerRequest = {
  target: string;
  type: 'new_worker';
  url: string;
};

export type SendMessageRequest = {
  target: string;
  worker: WorkerId;
  type: 'send_message';
  message: any;
};

export type TerminateRequest = {
  target: string;
  worker: WorkerId;
  type: 'terminate';
};

export type WorkerMessage = {
  target: string;
  worker: WorkerId;
  type: 'worker_message';
  message: any;
};
