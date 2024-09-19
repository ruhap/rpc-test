import { initKurre } from "./library/core/kurre"

const kurre = initKurre.create()

const exampleMiddleware = kurre.middleware(async ({ next }) => {
   await next({ayy: "lmao"})
})

export const baseProcedure = kurre.procedure
export const publicProcedure = baseProcedure.use(exampleMiddleware)

