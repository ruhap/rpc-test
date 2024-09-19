import { query } from "./query"

export const createReactQueryHooks = <T,>(router:T) => {
    return {
        useQuery: query(router)
    }
}