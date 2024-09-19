import { rpcClient } from "@/library/core/client"
import { AppRouter } from "@/routes"

export const client = rpcClient<AppRouter>("/api/kurre")

console.log(client.getExample)
