export type Message = {
  type: string;
  requestId?: string;
};

export type ConfirmResponse = Message & {
  type: "confirm_response";
  response: boolean;
};

export type MessageListener<T> = (
  message: Message & T,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: Message) => void,
) => boolean;
