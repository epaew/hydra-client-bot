import { crypto as cryptoNS } from "../../deps.ts";
const { crypto, toHashString } = cryptoNS;

type GameMode = "greedy" | "ignore" | "alive";

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

interface World {
  width: number;
  height: number;
  players: Player[];
  foods: Food[];
}

type HeatMapConstructorProps = [GameMode, World];

const GameModeMap: Record<GameMode, number> = {
  greedy: -1,
  ignore: 0,
  alive: 1,
};

class HeatMap {
  #mode: GameMode;
  #width: number;
  #height: number;
  #map: number[][];

  constructor(...[mode, { height, width, players, foods }]: HeatMapConstructorProps) {
    this.#mode = mode;
    this.#width = width;
    this.#height = height;
    this.#map = Array.from(new Array(height), () => new Array(width).fill(0));

    foods.forEach((food) => this.#reflectFood(food));
    players.forEach((player) => this.#reflectPlayer(player));

    this.#reflectEdge();
  }

  getHeatOf({ x, y }: Point) {
    if (x < 0 || this.#width <= x || y < 0 || this.#height <= y) {
      return 512; // = 2 ** 9
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

  /*
   * そのマスに進んだ結果、次の選択肢が狭まる場合に温度を上げる
   * 都度反映していくと次のマスの評価に影響を与えるため、
   * 一度 dummyMap に weight を記録してから this.#map に反映する
   */
  #reflectEdge() {
    const baseWeight = 32; // = 2 ** 5
    const dummyMap = Array.from(new Array(this.#height), () => new Array(this.#width).fill(0));
    const maxEffect = 2;
    const threshold = 128;

    for (let i = 0; i < this.#width; i++) {
      for (let j = 0; j < this.#height; j++) {
        const weight = [
          this.getHeatOf({ x: i - 1, y: j }),
          this.getHeatOf({ x: i, y: j - 1 }),
          this.getHeatOf({ x: i, y: j + 1 }),
          this.getHeatOf({ x: i + 1, y: j }),
        ]
          .filter((weight) => weight > threshold)
          .length * baseWeight;

        dummyMap[j][i] = weight;
      }
    }

    for (let i = 0; i < this.#width; i++) {
      for (let j = 0; j < this.#height; j++) {
        const weight = dummyMap[j][i];
        if (weight === 0) continue;

        this.#loop({ x: i, y: j }, maxEffect, (point, abs) => {
          this.#setHeatOf(point, weight, abs);
        });
      }
    }
  }

  /*
   * 移動可能な範囲に Food が落ちていたら反応するように、温度を変化させる
   * ゲーム続行を優先したいので、greedy であっても他プレイヤーと衝突しない程度の範囲で
   *   greedy: より数値の大きな food に対し積極的に反応する
   *   ignore: food があっても無視する
   *   alive: food があれば避ける、避けられなければより数値の小さな food に反応する
   */
  #reflectFood({ value, point: { x, y } }: Food) {
    const maxEffect = 2;
    const weight = GameModeMap[this.#mode] * (value * 0.5 + 48); // value: (1..6)

    this.#loop({ x, y }, maxEffect, (point, abs) => {
      this.#setHeatOf(point, weight, abs);
    });
  }

  #reflectPlayer(player: Player) {
    const [head, ...bodies] = player.bodies;

    this.#reflectPlayerHead(head);
    this.#reflectPlayerBodies(bodies);
  }

  #reflectPlayerHead({ x, y }: Point) {
    const maxEffect = 7;
    const weight = 256; // = 2 ** 8

    this.#loop({ x, y }, maxEffect, (point, abs) => {
      this.#setHeatOf(point, weight, abs);
    });
  }

  #reflectPlayerBodies(bodies: Point[]) {
    const maxEffect = 5;
    const weight = 256; // = 2 ** 8
    const length = bodies.length + 1;

    bodies.forEach(({ x, y }, index) => {
      index += 1;

      this.#loop({ x, y }, maxEffect, (point, abs) => {
        this.#setHeatOf(point, weight * (1 - index / length / 10), abs);
      });
    });
  }

  #loop({ x, y }: Point, maxEffect: number, callback: (point: Point, abs: number) => void) {
    if (maxEffect < 0) throw new TypeError("maxEffect must be greater than 0.");

    for (let i = x - maxEffect; i <= x + maxEffect; i++) {
      for (let j = y - maxEffect; j <= y + maxEffect; j++) {
        if (i < 0 || this.#width <= i || j < 0 || this.#height <= j) continue;

        const abs = Math.abs(i - x) + Math.abs(j - y);
        if (abs > maxEffect) continue;

        callback({ x: i, y: j }, abs);
      }
    }
  }

  /*
   * map に温度を設定する
   * 基準座標から 1 マス離れるごとに 1/8 に減衰させる
   */
  #setHeatOf({ x, y }: Point, weight: number, abs = 0) {
    this.#map[y][x] += weight * (8 ** -abs);
  }
}

export { HeatMap };
export type { GameMode };
