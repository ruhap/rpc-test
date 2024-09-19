type RpcClientOptions = string | FetchOptions;
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
  if (typeof options === "string") {
    options = { url: options };
  }
  const transport = fetchTransport(options);

  const sendRequest = async (method: string, args: any[]) => {
    const res = await transport({ method, args });

    if ("result" in res) {
      console.log("res.result", res.result);
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
    //   if (typeof prop === "symbol") return;
    //   if (prop === "toJSON") return;
      return (...args: any) => {
        const promise = sendRequest(prop.toString(), args);
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

    console.log("RES", res)
    if (!res.ok) {
        throw new Error(res.statusText)
      //throw new RpcError(res.statusText, res.status);
    }
    return await res.json();
  };
};
