import { JsonRpcRequest, JsonRpcResponse, JsonRpcSuccessResponse } from "./server";

//import superjson from "superjson";
export type RpcTransport = (
  req: JsonRpcRequest,
  abortSignal: AbortSignal
) => Promise<JsonRpcResponse>;

type RpcClientOptions = FetchOptions;

type FetchOptions = {
  url: string;
  credentials?: RequestCredentials;
};

type Promisify<T> = T extends (...args: any[]) => Promise<any>
  ? T
  : T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T;

type PromisifyMethods<T extends object> = {
  [K in keyof T]: Promisify<T[K]>;
};

export const rpcClient = <T extends object>(options: RpcClientOptions) => {
  const sendRequest = async (method: string, args: any[]) => {
    try {
      const res:JsonRpcSuccessResponse = await fetcher(options, {
        jsonrpc: "2.0",
        id: new Date().toString(),
        method,
        params: args,
      });

      return res.result;
    } catch (e) {
      console.log(e);
    }
  };

  return new Proxy(options, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver);
      }
      if (typeof prop === "symbol") return;
      if (prop === "toJSON") return;
      return (...args: any) => {
        const promise = sendRequest(prop.toString(), args);
        promise.finally(() => {}).catch(() => {});
        return promise;
      };
    },
  }) as PromisifyMethods<T>;
};

export const fetcher = async (
  options: FetchOptions,
  req: JsonRpcRequest
) => {
  const res = await fetch(options.url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return await res.json();
};
