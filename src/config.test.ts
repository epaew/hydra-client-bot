import { assertEquals, describe, it } from "../test_deps.ts";
import config from "./config.ts";

describe("config", () => {
  describe(".api", () => {
    describe(".host", () => {
      it(() => {
        assertEquals(config.api.host, Deno.env.get("API_HOST"));
      });
    });
  });

  describe(".player", () => {
    describe(".name", () => {
      it(() => {
        assertEquals(config.player.name, Deno.env.get("PLAYER_NAME"));
      });
    });

    describe(".password", () => {
      it(() => {
        assertEquals(config.player.password.length, 8);
      });
    });
  });
});
