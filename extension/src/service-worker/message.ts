export type GetWalletRequest = {
  target: string;
  type: 'get_wallet';
};

export type SetWalletRequest = {
  target: string;
  type: 'set_wallet';
  wallet: string;
};

export type CallRequest = {
  target: string;
  type: 'client_call';
  function: string;
  arguments: [any];
};

export * as guards from "./message.guard";
