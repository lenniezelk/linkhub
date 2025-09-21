import { drizzle } from "drizzle-orm/d1";
import { getBindings } from "@/lib/cf_bindings";

export function dbClient() {
    const cfBindings = getBindings();
    return drizzle(cfBindings.DB);
}