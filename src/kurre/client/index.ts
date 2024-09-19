import { rpcClient } from "@/library/core/client"
import { AppRouter } from "../server/routes"

export const client = rpcClient<AppRouter>("/api/kurre")

console.log(client.getExample)
