import { z } from "zod";
import { baseProcedure, publicProcedure, router } from ".";

export const appRouter = router({
  getHello: publicProcedure.query(async () => {
    return { message: "Hello World" };
  }),
  getExample: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return { message: input.name };
    }),
    getExampleBase: baseProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return { message: input.name };
    }),
  createHello: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => {
      return { message: input.message };
    }),
});

export type AppRouter = typeof appRouter;
