import { z } from "zod";
import { Middleware } from "./procedure";

export type OperationType<I extends Record<string, unknown>, O> =
  | QueryOperation<I, O>
  | MutationOperation<I, O>;

export type QueryOperation<
  Schema extends Record<string, unknown>,
  ZodInput = never
> = {
  type: "query";
  schema?: z.ZodType<Schema>;
  handler: <Ctx, Output>({
    ctx,
    input,
  }: {
    ctx: Ctx;
    input: ZodInput;
  }) => Promise<Output>;
  middlewares: Middleware<any>[];
};

export type MutationOperation<
  Schema extends Record<string, unknown>,
  ZodInput = never
> = {
  type: "mutation";
  schema?: z.ZodType<Schema>;
  handler: <Ctx, Output>({
    ctx,
    input,
  }: {
    ctx: Ctx;
    input: ZodInput;
  }) => Promise<Output>;
  middlewares: Middleware<any>[];
};

export const router = <T extends Record<string, OperationType<any, any>>>(
  obj: T
) => {
  return obj;
};

export type Router = typeof router;
