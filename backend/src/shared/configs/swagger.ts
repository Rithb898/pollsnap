import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { createRequire } from "module";
import path from "path";
import env from "./env";

const require = createRequire(import.meta.url);
const swaggerDocument = require(
  path.resolve(process.cwd(), "src/docs/swagger.json")
);

export const setupSwagger = (app: Express) => {
  if (env.NODE_ENV !== "development") return;
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
