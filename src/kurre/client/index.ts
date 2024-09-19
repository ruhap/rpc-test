import { rpcClient } from "@/library/core/client"
import { AppRouter } from "../server/routes"

export const client = rpcClient<AppRouter>("http://localhost:3000/api/kurre")

