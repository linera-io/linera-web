export type GetWalletRequest = {
  target: string;
  type: 'get_wallet';
};

export type SetWalletRequest = {
  target: string;
  type: 'set_wallet';
  wallet: string;
};

export type QueryApplicationRequest = {
  target: string;
  type: 'query_application';
  applicationId: string;
  query: string;
};

export * as guards from "./message.guard";

