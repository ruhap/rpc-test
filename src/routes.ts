import { z } from "zod";
import { publicProcedure } from "./kurre";
import { router } from "./library/core/router";

export const appRouter = router({
  getHello: publicProcedure.query(async ({ctx}) => {
    return { message: "Hello World" };
  }),
  getExample: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      return { ctx, input };
    }),
  createHello: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => {
      return { message: input.message };
    }),
});

export type AppRouter = typeof appRouter;
