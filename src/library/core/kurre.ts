import { Middleware, Procedure } from "./procedure";
import { router } from "./router";

export const initKurre = {
  create: () => {
    return {
      middleware: <T = object, R = void>(
        fn: Middleware<T, R>
      ): Middleware<T, R> => {
        return fn;
      },
      router,
      procedure: new Procedure(),
    };
  },
};
