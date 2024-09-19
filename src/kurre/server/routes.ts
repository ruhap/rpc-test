import { z } from "zod";
import { baseProcedure, publicProcedure, router } from ".";

export const appRouter = router({
  getHello: publicProcedure.query(async () => {
    return { message: "Hello World" };
  }),
  getExample: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log(ctx);
      return { message: `Hello ${input.name}` };
    }),
  getExampleBase: baseProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return { message: input.name };
    }),
  createHello: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => {
      console.log("LMAO YOU MUTATED")
      return { message: input.message };
    }),
});

export type AppRouter = typeof appRouter;
