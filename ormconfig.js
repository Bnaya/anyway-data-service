const RUNNING_IN_CLI =
  process.argv[1].endsWith("node_modules/.bin/typeorm") ||
  process.argv[1].endsWith(".ts");

// @ts-check
// const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-use-before-define
const params = validateConnectionEnvParams();

/**
 * @type {import("typeorm").ConnectionOptions}
 */
const ormConfig = {
  type: "postgres",
  host: params.host,
  port: params.port,
  username: params.user,
  password: params.password,
  database: params.database,
  schema: params.schema,
  synchronize: false,
  logging: RUNNING_IN_CLI ? true : false,
  entities: RUNNING_IN_CLI ? ["src/entity/**/*.ts"] : ["build/entity/**/*.js"],
  migrations: RUNNING_IN_CLI
    ? ["src/migration/**/*.ts"]
    : ["build/migration/**/*.js"],
  subscribers: RUNNING_IN_CLI
    ? ["src/subscriber/**/*.ts"]
    : ["build/subscriber/**/*.js"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
};
module.exports = ormConfig;

function validateConnectionEnvParams() {
  if (!process.env.POSTGRES_HOST) {
    throw new Error();
  }

  if (
    !process.env.POSTGRES_PORT ||
    !isFinite(Number.parseInt(process.env.POSTGRES_PORT))
  ) {
    throw new Error();
  }

  if (!process.env.POSTGRES_USER) {
    throw new Error();
  }

  if (!process.env.POSTGRES_PASSWORD) {
    throw new Error();
  }

  if (!process.env.POSTGRES_DATABASE) {
    throw new Error();
  }

  if (!process.env.POSTGRES_SCHEMA) {
    throw new Error();
  }

  return {
    host: process.env.POSTGRES_HOST,
    port: Number.parseInt(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    schema: process.env.POSTGRES_SCHEMA
  };
}
