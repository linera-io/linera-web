export type CallRequest = {
  type: "client_call";
  arguments: [any];
  function: string;
};

export async function callClientFunction(name: string, ...args: any): Promise<any> {
  return await chrome.runtime.sendMessage({
    type: "client_call",
    function: name,
    arguments: args,
  });
}
