// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const {
  ConnectionOptionsReader
} = require("typeorm/connection/ConnectionOptionsReader");

patchAsyncConnectionSetup();

const RUNNING_IN_CLI =
  (process.argv[1] || "").endsWith("node_modules/.bin/typeorm") ||
  (process.argv[1] || "").endsWith(".ts");

async function createOrmConfig() {
  // const path = require("path");

  const params = validateConnectionEnvParams();

  /**
   * @type {import("typeorm").ConnectionOptions}
   */
  const ormConfig = {
    type: "postgres",
    host: params.host,
    port: params.port,
    username: params.user,
    // @ts-ignore
    password: await decrypt(params.password),
    database: params.database,
    schema: params.schema,
    synchronize: false,
    logging: RUNNING_IN_CLI ? true : false,
    entities: RUNNING_IN_CLI
      ? ["src/entity/**/*.ts"]
      : ["build/entity/**/*.js"],
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

  // console.log(JSON.stringify(ormConfig, null, 2));

  return ormConfig;
}

module.exports = createOrmConfig;

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

function patchAsyncConnectionSetup() {
  const prototype = ConnectionOptionsReader.prototype;

  // @ts-ignore
  const original = prototype.normalizeConnectionOptions;

  // @ts-ignore
  prototype.normalizeConnectionOptions = function(options) {
    let actualOptions = options;

    if (typeof options === "function") {
      // @ts-ignore
      actualOptions = options();
    }

    if ("then" in actualOptions) {
      // @ts-ignore
      return actualOptions.then(arg => original.call(this, arg));
    }

    return original.call(this, actualOptions);
  };
}

// @ts-ignore
async function decrypt(ciphertext) {
  // @ts-ignore
  const kms = require("@google-cloud/kms");
  const client = new kms.KeyManagementServiceClient();

  const projectId = "anyway-hasadna";
  const keyRingId = "anyway-hasadna-data-service";
  const cryptoKeyId = "forenvvars";
  const locationId = "europe-west2";

  const fullKeyName = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  );

  // Decrypts the file using the specified crypto key
  const [result] = await client.decrypt({ name: fullKeyName, ciphertext });

  // console.log(ciphertext, result.plaintext.toString());

  return result.plaintext.toString();
}

module.exports.decrypt = decrypt;
