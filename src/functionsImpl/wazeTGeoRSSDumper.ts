import * as admin from "firebase-admin";
import phin from "phin";

const alertsURL =
  "https://il-georss.waze.com/rtserver/web/TGeoRSS?tk=ccp_partner&ccp_partner_name=The%20Public%20Knowledge%20Workshop&format=JSON&types=traffic,alerts,irregularities&polygon=33.717000,32.547000;34.722000,33.004000;35.793000,33.331000;35.914000,32.953000;35.750000,32.723000;35.395000,31.084000;34.931000,29.473000;33.717000,32.547000;33.717000,32.547000";

export async function wazeTGeoRSSDumperImpl() {
  // request: import("express").Request,
  // response: import("express").Response
  try {
    const bucket = admin.storage().bucket();

    const theDate = new Date();

    const year = theDate.getUTCFullYear();
    const month = theDate.getUTCMonth() + 1;
    const day = theDate.getUTCDate();

    const file = bucket.file(
      `waze-api-dumps-TGeoRSS/${year}/${month}/${day}/${theDate.getTime()}.json`,
      {}
    );

    const alertsResponse = await phin({
      url: alertsURL,
      parse: "none"
    });

    const writeableStream = file.createWriteStream({
      metadata: {
        contentType: "application/json"
      }
    });

    await new Promise<void>((res, rej) => {
      writeableStream.write(alertsResponse.body, "utf8", error => {
        if (error) {
          rej(error);
        } else {
          res();
        }
      });
    });

    const streamFinished = new Promise<void>(res => {
      writeableStream.once("finish", res);
    });

    await new Promise<void>(res => {
      writeableStream.end(res);
    });

    await streamFinished;

    console.log({
      dumpDone: "yes"
    });

    // response.json({
    //   here: "yes",
    //   length: JSON.stringify(alertsResponse.body).length
    // });
  } catch (e) {
    console.error(e);
    // response.status(401).json(e);
  }
}
