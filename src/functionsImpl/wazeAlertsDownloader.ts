import phin from "phin";
import { In, createConnection } from "typeorm";
import { WazeJams } from "../entity/WazeJams";
import { WazeAlerts } from "../entity/WazeAlerts";

const alertsURL =
  "https://il-georss.waze.com/rtserver/web/TGeoRSS?tk=ccp_partner&ccp_partner_name=The%20Public%20Knowledge%20Workshop&format=JSON&types=traffic,alerts,irregularities&polygon=33.717000,32.547000;34.722000,33.004000;35.793000,33.331000;35.914000,32.953000;35.750000,32.723000;35.395000,31.084000;34.931000,29.473000;33.717000,32.547000;33.717000,32.547000";

export async function wazeAlertsDownloaderImpl() {
  const connection = await createConnection();

  const alertsResponse = await phin({
    url: alertsURL,
    parse: "json"
  });

  await connection.transaction(async transaction => {
    const jamsRepo = transaction.getRepository(WazeJams);
    const alertsRepo = transaction.getRepository(WazeAlerts);

    const oldJams = await jamsRepo.find({
      where: {
        uuid: In(alertsResponse.body.jams.map((j: any) => j.uuid))
      }
    });

    const jamsToInsert = alertsResponse.body.jams
      .filter((newJam: any) => {
        return !oldJams.some(oldJam => {
          // the driver returns big int numbers as strings
          return newJam.uuid.toString() === oldJam.uuid;
        });
      })
      .map((newJam: any) => {
        return {
          uuid: newJam.uuid,
          blockingAlertUuid: newJam.blockingAlertUuid || null,
          city: newJam.city,
          street: newJam.street
        };
      });

    await jamsRepo.save(jamsToInsert);

    const oldAlerts = await alertsRepo.find({
      where: {
        uuid: In(alertsResponse.body.alerts.map((alert: any) => alert.uuid))
      }
    });

    const alertsToInsert = alertsResponse.body.alerts
      .filter((newAlert: any) => {
        return !oldAlerts.some(oldAlert => {
          return oldAlert.uuid === newAlert.uuid;
        });
      })
      .map((newAlert: any) => {
        return {
          uuid: newAlert.uuid,
          city: newAlert.city,
          street: newAlert.street,
          type: newAlert.type,
          subtype: newAlert.subtype,
          reliability: newAlert.reliability,
          location: {
            type: "Point",
            coordinates: [newAlert.location.x, newAlert.location.y]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        };
      });

    await alertsRepo.save(alertsToInsert);

    const alertsToUpdateReliability = oldAlerts
      .filter((oldAlert: any) => {
        return alertsResponse.body.alerts.some((incomingAlert: any) => {
          return (
            oldAlert.uuid === incomingAlert.uuid &&
            oldAlert.reliability !== incomingAlert.reliability
          );
        });
      })
      .map(alert => {
        alert.reliability = alertsResponse.body.alerts.find(
          (a: any) => a.uuid === alert.uuid
        ).reliability;

        delete alert.location;

        return alert;
      });

    await alertsRepo.save(alertsToUpdateReliability);

    console.log(
      `Waze update done: Alerts: ${alertsToInsert.length}. Jams: ${jamsToInsert.length}. Updated Alerts: ${alertsToUpdateReliability.length}`
    );
  });

  await connection.close();
}
