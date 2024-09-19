import { MutationOperation, OperationType, QueryOperation } from "./router";
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

  type InferInput<T> = T extends OperationType<infer I, any> ? I : {};
  type InferOutput<T> = T extends OperationType<any, infer O> ? O : {};

  return new Proxy(options, {
    get(target, prop, receiver) {
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver);
      }
      if (typeof prop === "symbol") return;
      if (prop === "toJSON") return;

      return {
        $get: async (args: { input: InferInput<T[typeof prop & keyof T]> }) => {
          return sendRequest(prop.toString(), [args.input]);
        },
        $post: async (args: { input: InferInput<T[typeof prop & keyof T]> }) => {
          return sendRequest(prop.toString(), [args.input]);
        },
      };
    },
  }) as {
    [K in keyof T]: T[K] extends QueryOperation<any, any>
      ? {
          $get: (args: { input: InferInput<T[K]> }) => Promise<InferOutput<T[K]>>;
        }
      : T[K] extends MutationOperation<any, any>
      ? {
          $post: (args: { input: InferInput<T[K]> }) => Promise<InferOutput<T[K]>>;
        }
      : never;
  };
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
