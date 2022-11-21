import { Direction, Player, World } from "./types/index.ts";

import { Client as HTTPClient } from "../http/client.ts";

type JoinProps = {
  name: string;
  password: string;
};
type JoinResult = Player;

type GetWorldResult = World;

type SetPlayerHeadDirectionProps = {
  player: {
    id: number;
    password: string;
  };
  direction: Direction;
};

class Client {
  #httpClient: HTTPClient;

  constructor(baseURL?: string) {
    this.#httpClient = new HTTPClient(baseURL);
  }

  async join(props: JoinProps): Promise<JoinResult> {
    const { name, password } = props;
    const response = await this.#httpClient.post(
      `/api/player`,
      JSON.stringify({ name, password }),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );
    const { id } = await response.json();

    return { id, name, password };
  }

  async getWorld(): Promise<GetWorldResult> {
    const response = await this.#httpClient.get(`/api/world.json`, { headers: { Accept: "application/json" } });
    return response.json();
  }

  async setPlayerHeadDirection(props: SetPlayerHeadDirectionProps): Promise<void> {
    const { player: { id, password }, direction } = props;
    await this.#httpClient.post(
      `/api/player/${id}/move`,
      JSON.stringify({ direction, password }),
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );
  }
}

export { Client };
