import { log, path } from "../../deps.ts";

type Logger = log.Logger;
const timestamp = Date.now();

log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO"),
    file: new log.handlers.FileHandler("DEBUG", {
      filename: path.join(Deno.cwd(), "log", `${timestamp}.log`),
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

const logger = log.getLogger();

export { logger };
export type { Logger };
