import phin from "phin";
import { In, createConnection, Repository } from "typeorm";
import { WazeJams } from "../entity/WazeJams";
import { WazeAlerts } from "../entity/WazeAlerts";
import { WazeIrregularities } from "../entity/WazeIrregularities";

const alertsURL =
  "https://il-georss.waze.com/rtserver/web/TGeoRSS?tk=ccp_partner&ccp_partner_name=The%20Public%20Knowledge%20Workshop&format=JSON&types=traffic,alerts,irregularities&polygon=33.717000,32.547000;34.722000,33.004000;35.793000,33.331000;35.914000,32.953000;35.750000,32.723000;35.395000,31.084000;34.931000,29.473000;33.717000,32.547000;33.717000,32.547000";

export async function wazeAlertsDownloaderImpl() {
  const connection = await createConnection();

  const dataSourceResponse = await phin({
    url: alertsURL,
    parse: "json"
  });

  await connection.transaction(async transaction => {
    const jamsRepo = transaction.getRepository(WazeJams);
    const alertsRepo = transaction.getRepository(WazeAlerts);
    const irregularitiesRepo = transaction.getRepository(WazeIrregularities);

    const { jamsToInsert } = await handleJams(jamsRepo, dataSourceResponse);
    const { alertsToInsert, alertsToUpdateReliability } = await handleAlerts(
      alertsRepo,
      dataSourceResponse
    );

    const { irregularitiesToInsert } = await handleIrregularities(
      irregularitiesRepo,
      dataSourceResponse
    );

    // console.log(irregularitiesToInsert.length);

    console.log(
      `Waze update done: Alerts: ${alertsToInsert.length}.` +
        ` Jams: ${jamsToInsert.length}. Irregularities: ${irregularitiesToInsert.length}.` +
        ` Updated Alerts: ${alertsToUpdateReliability.length}`
    );
  });

  await connection.close();
}

async function handleJams(
  jamsRepo: Repository<WazeJams>,
  dataSourceResponse: any
) {
  const oldJams = await jamsRepo.find({
    where: {
      uuid: In(dataSourceResponse.body.jams.map((j: any) => j.uuid))
    }
  });

  const jamsToInsert = dataSourceResponse.body.jams
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

  return {
    jamsToInsert
  };
}

async function handleAlerts(
  alertsRepo: Repository<WazeAlerts>,
  dataSourceResponse: any
) {
  const oldAlerts = await alertsRepo.find({
    where: {
      uuid: In(dataSourceResponse.body.alerts.map((alert: any) => alert.uuid))
    }
  });

  const alertsToInsert = dataSourceResponse.body.alerts
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
      return dataSourceResponse.body.alerts.some((incomingAlert: any) => {
        return (
          oldAlert.uuid === incomingAlert.uuid &&
          oldAlert.reliability !== incomingAlert.reliability
        );
      });
    })
    .map(alert => {
      alert.reliability = dataSourceResponse.body.alerts.find(
        (a: any) => a.uuid === alert.uuid
      ).reliability;

      delete alert.location;

      return alert;
    });

  await alertsRepo.save(alertsToUpdateReliability);

  return {
    alertsToInsert,
    alertsToUpdateReliability
  };
}

async function handleIrregularities(
  irregularitiesRepo: Repository<WazeIrregularities>,
  dataSourceResponse: any
) {
  const oldIrregularities = await irregularitiesRepo.find({
    where: {
      id: In(dataSourceResponse.body.irregularities.map((ir: any) => ir.id))
    }
  });

  const irregularitiesToInsert = dataSourceResponse.body.irregularities
    .filter((newIr: any) => {
      return !oldIrregularities.some(oldIr => {
        return oldIr.id === newIr.id;
      });
    })
    .map(
      (newIr: any): Partial<WazeIrregularities> => {
        return {
          id: newIr.id,
          type: newIr.type,
          detectionDate: newIr.detectionDate,
          updateDate: newIr.updateDate,
          alertsCount: newIr.alertsCount,
          driversCount: newIr.driversCount,
          delaySeconds: newIr.delaySeconds,
          jamLevel: newIr.jamLevel,
          length: newIr.length,
          nThumbsUp: newIr.nThumbsUp,
          regularSpeed: newIr.regularSpeed,
          seconds: newIr.seconds,
          severity: newIr.severity,
          speed: newIr.speed,
          street: newIr.street,
          trend: newIr.trend,
          line: {
            type: "LineString",
            coordinates: newIr.line.map(
              ({ x, y }: { x: number; y: number }) => [x, y]
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any
        };
      }
    );

  await irregularitiesRepo.save(irregularitiesToInsert);

  // TODO: update

  // const alertsToUpdateReliability = oldAlerts
  //   .filter((oldAlert: any) => {
  //     return alertsResponse.body.alerts.some((incomingAlert: any) => {
  //       return (
  //         oldAlert.uuid === incomingAlert.uuid &&
  //         oldAlert.reliability !== incomingAlert.reliability
  //       );
  //     });
  //   })
  //   .map(alert => {
  //     alert.reliability = alertsResponse.body.alerts.find(
  //       (a: any) => a.uuid === alert.uuid
  //     ).reliability;

  //     delete alert.location;

  //     return alert;
  //   });

  // await alertsRepo.save(alertsToUpdateReliability);

  return {
    irregularitiesToInsert
  };
}
