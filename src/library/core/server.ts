import { NextRequest } from "next/server";
import { OperationType } from "./router";
//import superjson from "superjson";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params: any[];
}

export interface BaseJsonRpcResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
}

export interface JsonRpcErrorResponse extends BaseJsonRpcResponse {
  error: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface JsonRpcSuccessResponse extends BaseJsonRpcResponse {
  result: any;
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

export const handleRpc = async <
  T extends Record<string, OperationType<any, any>>
>(
  request: NextRequest,
  router: T
): Promise<JsonRpcErrorResponse | JsonRpcSuccessResponse> => {
  const req = await request.json();

  try {
    const operation = router[req.method];

    for (const middleware of operation.middlewares) {
      await middleware({ ctx: {}, next: async (ctx) => ({ ...ctx }) });
    }

    if (operation.schema) {
      const parsedInput = operation.schema.safeParse(req.params[0]);

      if (!parsedInput.success) {
        return {
          jsonrpc: "2.0",
          id: new Date().toString(),
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
        id: new Date().toString(),
        result: result,
      };
    } else {
      const result = await operation.handler({
        ctx: {},
        input: req.params[0],
      });

      return {
        jsonrpc: "2.0",
        id: new Date().toString(),
        result: result,
      };
    }
  } catch (e) {
    return {
      jsonrpc: "2.0",
      id: new Date().toString(),
      error: {
        code: 1,
        message: "error",
      },
    };
  }
};
