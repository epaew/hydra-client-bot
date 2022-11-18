import { dotenv } from "../deps.ts";

await dotenv.config({ export: true, safe: true });

const config = {
  api: {
    host: Deno.env.get("API_HOST") as string,
  },
  player: {
    name: Deno.env.get("PLAYER_NAME") as string,
    password: ((Math.random() + 1) * Math.pow(10, 16)).toString(36).slice(1, 9),
  },
};

export default config;
export const { api, player } = config;
