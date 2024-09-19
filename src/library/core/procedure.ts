import { z } from "zod";
import { OperationType } from "./router";

export type Middleware<I> = ({
  ctx,
  next,
}: {
  ctx: I;
  next: <B>(args?: B) => B & I;
}) => Promise<I>;

export class Procedure<Ctx = object> {
  private readonly middlewares: Middleware<Ctx>[] = [];

  constructor(middlewares: Array<Middleware<Ctx>> = []) {
    this.middlewares = middlewares;
  }

  use<T, Return = void>(
    fn: ({
      ctx,
      next,
    }: {
      ctx: Ctx;
      next: <B>(args?: B) => Promise<B & Ctx>;
    }) => Promise<Return>
  ): Procedure<Ctx & T & Return> {
    return new Procedure<Ctx & T & Return>([...this.middlewares, fn as any]);
  }

  input = <Schema extends z.ZodType<any, any, any>>(schema: Schema) => ({
    query: <Output>(
      fn: ({
        input,
        ctx,
      }: {
        input: z.infer<Schema>;
        ctx: Ctx;
      }) => Output | Promise<Output>
    ): OperationType<z.infer<Schema>, Output> => ({
      type: "query",
      schema,
      handler: fn as any,
      middlewares: this.middlewares,
    }),

    mutation: <Output>(
      fn: ({
        input,
        ctx,
      }: {
        input: z.infer<Schema>;
        ctx: Ctx;
      }) => Output | Promise<Output>
    ): OperationType<z.infer<Schema>, Output> => ({
      type: "mutation",
      schema,
      handler: fn as any,
      middlewares: this.middlewares,
    }),
  });

  query<Output>(
    fn: ({ input }: { input: never; ctx: Ctx }) => Output | Promise<Output>
  ): OperationType<{}, Output> {
    return {
      type: "query",
      handler: fn as any,
      middlewares: this.middlewares,
    };
  }

  mutation<Output>(
    fn: ({ input, ctx }: { input: never; ctx: Ctx }) => Output | Promise<Output>
  ): OperationType<{}, Output> {
    return {
      type: "mutation",
      handler: fn as any,
      middlewares: this.middlewares,
    };
  }
}
