import config from "../config.ts";
import { Client } from "../lib/hydra-api/client.ts";
import { logger } from "../lib/logger.ts";

import { getNextDirection } from "./get-next-direction.ts";
import { HeatMap } from "./heat-map.ts";

const start = async () => {
  const client = new Client(config.api.host);
  const me = await client.join(config.player);

  const loopId = setInterval(
    async () => {
      try {
        const world = await client.getWorld();
        const player = world.players.find((p) => p.id === me.id);

        if (!player) {
          logger.warning(`player: ${me.name} is game over.`);
          clearInterval(loopId);
          return;
        }

        const heatMap = new HeatMap(world);
        const nextDirection = getNextDirection(heatMap)({
          currentDirection: player.headDirection,
          currentPoint: player.bodies[0],
        });
        if (player.headDirection !== nextDirection) {
          await client.setPlayerHeadDirection({ player: me, direction: nextDirection });
        }
      } catch (e) {
        logger.error(e);
      }
    },
    1000,
  );
};

const HydraBot = { start };

export { HydraBot };
