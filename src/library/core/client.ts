import { OperationType, QueryOperation } from "./router";
import { JsonRpcRequest, JsonRpcSuccessResponse } from "./server";

//import superjson from "superjson";

type RpcClientOptions = FetchOptions;

type FetchOptions = {
  url: string;
  credentials?: RequestCredentials;
};

// type Promisify<T> = T extends (...args: any[]) => Promise<any>
//   ? T
//   : T extends (...args: infer A) => infer R
//   ? (...args: A) => Promise<R>
//   : T;

// type PromisifyMethods<T extends object> = {
//   [K in keyof T]: Promisify<T[K]>;
// };

export const rpcClient = <T extends object>(options: RpcClientOptions) => {
  const sendRequest = async (
    method: string,
    args: Array<Record<string, unknown>>
  ) => {
    try {
      const res: JsonRpcSuccessResponse = await fetcher(options, {
        jsonrpc: "2.0",
        id: 1,
        method,
        params: args,
      });

      return res.result;
    } catch (e) {
      console.log(e);
    }
  };

  type InferInput<T> = T extends OperationType<infer I, any> ? I : {}
  type InferOutput<T> = T extends OperationType<any, infer I> ? I : {}

  return new Proxy(options, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver);
      }
      if (typeof prop === "symbol") return;
      if (prop === "toJSON") return;
      return (...args: Array<Record<string, unknown>>) => {
        const promise = sendRequest(prop.toString(), args);
        promise.finally(() => {}).catch(() => {});
        return promise;
      };
    },
  }) as {
    [K in keyof T]: T[K] extends QueryOperation<any, any>
      ? {
          $get: {
            input: InferInput<T[K]>
            output: InferOutput<T[K]>
          }
        }
      : {
          $post: {
            input: InferInput<T[K]>
            output: InferOutput<T[K]>
          }
        }
  };;
};


export const fetcher = async (options: FetchOptions, req: JsonRpcRequest) => {
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
