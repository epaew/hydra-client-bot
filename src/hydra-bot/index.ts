import { Client } from "../lib/hydra-api/client.ts";
import { logger } from "../lib/logger.ts";

import { getNextDirection } from "./get-next-direction.ts";
import { GameMode, HeatMap } from "./heat-map.ts";

interface Start {
  (props: { apiHost: string; playerName: string; mode: GameMode }): Promise<void>;
}

const generatePassward = () => ((Math.random() + 1) * Math.pow(10, 16)).toString(36).slice(1, 9);

const start: Start = async ({ apiHost, playerName, mode }) => {
  const client = new Client(apiHost);
  const me = await client.join({ name: playerName, password: generatePassward() });
  let previousHeatMap: HeatMap;

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

        const heatMap = new HeatMap(mode, world);
        if (await heatMap.hash() === await previousHeatMap?.hash()) return;
        previousHeatMap = heatMap;

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
    750,
  );
};

const HydraBot = { start };

export { HydraBot };
