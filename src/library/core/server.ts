import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { OperationType } from "./router";

type Response =
  | { type: "success"; result: unknown }
  | { type: "error"; error: { code: number; message: string } };

export const handleRpc = async <
  T extends Record<string, OperationType<any, any>>
>(
  request: NextRequest,
  router: T
): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const operationName = url.pathname.split("/").pop() as keyof T;
    const operation = router[operationName];

    if (!operation) {
      return {
        type: "error",
        error: { code: 404, message: "Operation not found" },
      };
    }

    let inputData: unknown;

    if (request.method === "GET" && operation.type === "query") {
      inputData = Object.fromEntries(url.searchParams.entries());
    } else if (request.method === "POST" && operation.type === "mutation") {
      console.log("JIIIIIBOYYYY")
      inputData = await request.json();
      console.log("jiiboy", inputData)

    } else {
      return {
        type: "error",
        error: { code: 405, message: "Method Not Allowed" },
      };
    }

    if (operation.schema) {
      try {
        const parsedInput = operation.schema.safeParse(inputData);

        console.log("parsedInput", parsedInput);

        if (!parsedInput.success) {
          return {
            type: "error",
            error: { code: 500, message: "Schema not correct" },
          };
        }

        for (const middleware of operation.middlewares) {
          await middleware({ ctx: {}, next: async (ctx) => ({ ...ctx }) });
        }

        if (!operation.handler) {
          return {
            type: "error",
            error: { code: 500, message: "Handler not found" },
          };
        }

        const result = await operation.handler({
          ctx: {},
          input: parsedInput.data,
        });

        console.log("result", result);

        return { type: "success", result };
      } catch (error) {
        if (error instanceof ZodError) {
          return {
            type: "error",
            error: { code: 400, message: "Invalid input" },
          };
        }

        throw error;
      }
    } else {
      return {
        type: "error",
        error: { code: 500, message: "Schema not found" },
      };
    }
  } catch (e: unknown) {
    console.log(e);
    return {
      type: "error",
      error: { code: 500, message: "Internal server error" },
    };
  }
};
