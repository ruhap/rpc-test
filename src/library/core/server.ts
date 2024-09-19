import { NextRequest } from "next/server";
import { BaseRouter, OperationType } from "./router";
//import superjson from "superjson";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params: Array<Record<string, unknown>>;
}

export interface BaseJsonRpcResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
}

export interface JsonRpcErrorResponse extends BaseJsonRpcResponse {
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface JsonRpcSuccessResponse extends BaseJsonRpcResponse {
  result: unknown;
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

export const handleRpc = async <T extends BaseRouter>(
  request: NextRequest,
  router: T
): Promise<JsonRpcErrorResponse | JsonRpcSuccessResponse> => {
  const req = await request.json();

  try {
    const operation = router[req.method];

    for (const middleware of operation.middlewares) {
      await middleware({
        ctx: { test: "in middleware loop" },
        next: async (ctx) => ({ ...ctx }),
      });
    }

    if (operation.schema) {
      const parsedInput = operation.schema.safeParse(req.params[0]);

      if (!parsedInput.success) {
        return {
          jsonrpc: "2.0",
          id: 1,
          error: {
            code: 1,
            message: "schema error",
          },
        };
      }

      const result = await operation.handler({
        ctx: {},
        input: parsedInput.data,
      });

      return {
        jsonrpc: "2.0",
        id: 1,
        result: result,
      };
    } else {
      const result = await operation.handler({
        ctx: {},
        input: req.params[0],
      });

      return {
        jsonrpc: "2.0",
        id: 1,
        result: result,
      };
    }
  } catch (e: unknown) {
    console.log(e);
    return {
      jsonrpc: "2.0",
      id: 1,
      error: {
        code: 1,
        message: "error",
      },
    };
  }
};
