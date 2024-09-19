import { rpcClient } from "@/library/core/client"
import { AppRouter } from "../server/routes"

export const client = rpcClient<AppRouter>({url: "/api/kurre/"})

 const g= client.getExample.$get({input: {name: "jee"}})
 const c = client.createHello.$post({input: {message: "lllll"}})

//console.log(g)
//console.log(c)