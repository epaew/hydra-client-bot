import { HeatMap } from "./heat-map.ts";

type Direction = "North" | "East" | "South" | "West";

interface GetNextDirectionProps {
  currentDirection: Direction;
  currentPoint: {
    x: number;
    y: number;
  };
}
interface GetNextDirection {
  (heatMap: HeatMap): (props: GetNextDirectionProps) => Direction;
}

const getNextDirection: GetNextDirection = (heatMap) => {
  return ({ currentDirection, currentPoint: { x, y } }) => {
    const heats: Record<Direction, number> = {
      North: heatMap.getHeatOf({ x, y: y - 1 }),
      East: heatMap.getHeatOf({ x: x + 1, y }),
      South: heatMap.getHeatOf({ x, y: y + 1 }),
      West: heatMap.getHeatOf({ x: x - 1, y }),
    };
    const minHeat = Math.min(...Object.values(heats));

    // API request の回数を減らしたいので、方向転換が不要なら現在の方向を維持する
    if (heats[currentDirection] === minHeat) {
      return currentDirection;
    } else {
      const directions = (Object.keys(heats) as Direction[])
        .filter((direction) => heats[direction] === minHeat);

      return directions[Math.floor(Math.random() * directions.length)];
    }
  };
};

export { getNextDirection };
