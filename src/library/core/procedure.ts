import { z } from "zod";
import { MutationOperation, QueryOperation } from "./router";

export type Middleware<I> = ({
  ctx,
  next,
}: {
  ctx: I
  next: <B>(args?: B) => B & I
}) => Promise<any>

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

  input = <Schema extends Record<string, unknown>>(schema: z.ZodSchema<Schema>) => ({
    query: <Output>(
      fn: ({
        input,
        ctx,
      }: {
        input: Schema;
        ctx: Ctx;
      }) => Output | Promise<Output>
    ): QueryOperation<Schema, Output> => ({
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
        input:Schema;
        ctx: Ctx;
      }) => Output | Promise<Output>
    ): MutationOperation<Schema, Output> => ({
      type: "mutation",
      schema,
      handler: fn as any,
      middlewares: this.middlewares,
    }),
  });

  query<Output>(
    fn: ({ input, ctx }: { input: never; ctx: Ctx }) => Output | Promise<Output>
  ): QueryOperation<{}, Output> {
    return {
      type: "query",
      handler: fn as any,
      middlewares: this.middlewares,
    };
  }

  mutation<Output>(
    fn: ({ input, ctx }: { input: never; ctx: Ctx }) => Output | Promise<Output>
  ): MutationOperation<{}, Output> {
    return {
      type: "mutation",
      handler: fn as any,
      middlewares: this.middlewares,
    };
  }
}
