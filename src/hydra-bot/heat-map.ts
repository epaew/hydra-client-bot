import { crypto as cryptoNS } from "../../deps.ts";
const { crypto, toHashString } = cryptoNS;

import { logger } from "../lib/logger.ts";

interface Point {
  x: number;
  y: number;
}
interface Player {
  bodies: Point[];
}
interface Food {
  value: number;
  point: Point;
}

interface HeatMapConstructorProps {
  width: number;
  height: number;
  players: Player[];
  foods: Food[];
}

class HeatMap {
  #width: number;
  #height: number;
  #map: number[][];

  constructor({ height, width, players, foods }: HeatMapConstructorProps) {
    this.#width = width;
    this.#height = height;
    this.#map = Array.from(new Array(height), () => new Array(width).fill(0));

    players.forEach((player) => this.#reflectPlayer(player));
    foods.forEach((food) => this.#reflectFood(food));

    logger.debug(this.#map);
  }

  getHeatOf({ x, y }: Point) {
    if (x < 0 || this.#width <= x || y < 0 || this.#height <= y) {
      return Number.MAX_VALUE;
    } else {
      return this.#map[y][x];
    }
  }

  async hash() {
    return toHashString(
      await crypto.subtle.digest(
        "MD5",
        new TextEncoder().encode(JSON.stringify(this.#map)),
      ),
    );
  }

  #reflectFood({ value, point: { x, y } }: Food) {
    this.#map[y][x] -= value;
  }

  #reflectPlayer(player: Player) {
    const [head, ...bodies] = player.bodies;

    this.#reflectPlayerHead(head);
    this.#reflectPlayerBodies(bodies);
  }

  #reflectPlayerHead({ x, y }: Point) {
    this.#map[y][x] += 1;
  }

  #reflectPlayerBodies(bodies: Point[]) {
    bodies.forEach(({ x, y }) => {
      this.#map[y][x] += 1;
    });
  }
}

export { HeatMap };
