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
});
