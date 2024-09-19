import { Middleware } from "./procedure";

export type OperationType<Schema extends Record<string, unknown>, ZodInput = never> = {
  type: "mutation" |"query";
  schema?: Schema;
  handler: <Ctx, Output>({
    ctx,
    input,
  }: {
    ctx: Ctx;
    input: ZodInput;
  }) => Promise<Output>;
  middlewares: Middleware<any>[]
};

export const router = <T extends Record<string, OperationType<any, any>>>(
  obj: T
) => {
  return obj;
};

export type Router = typeof router