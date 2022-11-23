import { api } from "./config.ts";
import { HydraBot } from "./hydra-bot/index.ts";

HydraBot.start({ apiHost: api.host, playerName: "epaew+alive@hydra-bot", mode: "alive" });
// HydraBot.start({ apiHost: api.host, playerName: "epaew+greedy@hydra-bot", mode: "greedy" });
// HydraBot.start({ apiHost: api.host, playerName: "epaew+ignore@hydra-bot", mode: "ignore" });
