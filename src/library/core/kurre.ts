import { Procedure } from "./procedure";
import { router } from "./router";

type MiddlewareFunction<T = object, R = void> = (params: {
  ctx: T;
  next: <B>(args: B) => Promise<B & T>;
}) => Promise<R>;

export const initKurre = {
  create: () => {
    return {
      middleware: <T = object, R = void>(
        fn: MiddlewareFunction<T, R>
      ): MiddlewareFunction<T, R> => {
        return fn;
      },
      router,
      procedure: new Procedure(),
    };
  },
};
