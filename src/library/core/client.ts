type RpcClientOptions = string | { url: string };

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
  const sendRequest = (method: string, args: any[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Response from ${method} with args: ${JSON.stringify(args)}`);
      }, 1000);
    });
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
        return promise;
      };
    },
  }) as typeof options & PromisifyMethods<T>;
};
