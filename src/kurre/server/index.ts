import { initKurre } from "@/library/core/kurre"

const kurre = initKurre.create()

const exampleMiddleware = kurre.middleware(async ({ next }) => {
   console.log("exampleMiddleware ran")
   await next({ayy: "lmao"})
})

export const router = kurre.router
export const baseProcedure = kurre.procedure
export const publicProcedure = baseProcedure.use(exampleMiddleware)