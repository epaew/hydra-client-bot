import { dotenv } from "../deps.ts";

await dotenv.config({ export: true, safe: true });

const config = {
  api: {
    host: Deno.env.get("API_HOST") as string,
  },
};

export default config;
export const { api } = config;
