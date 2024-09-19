//import superjson from "superjson";

type RpcClientOptions = FetchOptions;
type FetchOptions = { url: string };

type Promisify<T> = T extends (...args: any[]) => Promise<any>
  ? T
  : T extends (...args: infer A) => infer R
  ? (...args: A) => Promise<R>
  : T;

type PromisifyMethods<T extends object> = {
  [K in keyof T]: Promisify<T[K]>;
};

export const rpcClient = <T extends object>(options: RpcClientOptions) => {

  const transport = fetchTransport(options);
  
  const sendRequest = async (method: string, args: any[]) => {
    const req = {
      jsonrpc: "2.0",
      id:  new Date(),
      method,
      params: args,
    };
    //const raw = await transport(superjson.serialize(req));
    const raw = await transport(req)
    //const res = superjson.deserialize(raw);
    const res = raw

    if ("result" in res) {
      return res.result;
    } else if ("error" in res) {
      console.log("error");
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

export const fetchTransport = (options: FetchOptions) => {
  return async (req: any): Promise<any> => {
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
      //throw new RpcError(res.statusText, res.status);
    }

    return await res.json();
  };
};
