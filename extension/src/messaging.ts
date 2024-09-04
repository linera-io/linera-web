export type Request = {
  type: string;
};

export type GetWalletRequest = Request & {
  type: 'get_wallet';
};

export function isGetWalletRequest(message: Request): message is GetWalletRequest {
  const get_wallet_request = message as GetWalletRequest;
  return get_wallet_request.type === 'get_wallet'
}

export type SetWalletRequest = Request & {
  type: 'set_wallet';
  wallet: string;
};

export function isSetWalletRequest(message: Request): message is SetWalletRequest {
  const set_wallet_request = message as SetWalletRequest;
  return set_wallet_request.type === 'set_wallet'
    && typeof set_wallet_request.wallet === 'string'
}

export type CallRequest = Request & {
  type: 'client_call';
  function: string;
  arguments: [any];
};

export function isCallRequest(message: Request): message is CallRequest {
  const call_request = message as CallRequest;
  return call_request.type === 'client_call'
    && typeof call_request.function === 'string'
    && call_request.arguments instanceof Array;
}

export async function callClientFunction(name: string, ...args: any): Promise<any> {
  return await chrome.runtime.sendMessage({
    type: 'client_call',
    function: name,
    arguments: args,
  });
}
