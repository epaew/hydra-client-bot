import config from "../config.ts";
import { Client } from "../lib/hydra-api/client.ts";
import { logger } from "../lib/logger.ts";

const start = async () => {
  const client = new Client(config.api.host);
  const me = await client.join(config.player);

  const loopId = setInterval(
    async () => {
      const world = await client.getWorld();
      const player = world.players.find((p) => p.id === me.id);

      if (!player) {
        logger.warning(`player: ${me.name} is game over.`);
        clearInterval(loopId);
        return;
      }
    },
    1000,
  );
};

const HydraBot = { start };

export { HydraBot };
