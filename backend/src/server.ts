import app from "./app";
import env from "./shared/configs/env";
import { logger } from "./shared/utils/logger";
import { configureGracefulShutdown } from "./shared/utils/shutdown";
import { initializeSocket } from "./socket";

const port = env.PORT || 9000;

const server = app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
  logger.info(`[server]: Environment: ${env.NODE_ENV}`);
  logger.info(
    `[server]: Swagger docs are available at http://localhost:${port}/api/docs`
  );
  logger.info("[server]: Socket.io initialized");
});

initializeSocket(server);

configureGracefulShutdown(server);
