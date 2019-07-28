import "tslib";
// ATM needed for firebase on server
import "dotenv/config";
import { createConnection } from "typeorm";
import functions = require("firebase-functions");
import { wazeAlertsDownloaderImpl } from "./functionsImpl/wazeAlertsDownloader";

export const helloWorld = functions
  .region("europe-west2")
  .https.onRequest(async (req, res) => {
    const con = await createConnection();
    try {
      const rows = await con.query(
        "SELECT * FROM public.municipalities LIMIT 2"
      );
      res.send({ rows });
    } catch (e) {
      console.error(e);
      res.status(500).send(e);
    } finally {
      await con.close();
    }
  });

export const wazeAlertsDownloader = functions
  .region("europe-west2")
  .pubsub.schedule("every 4 minutes")
  .onRun(wazeAlertsDownloaderImpl);
