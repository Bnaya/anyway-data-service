import { wazeAlertsDownloaderImpl } from "../functionsImpl/wazeAlertsDownloader";

wazeAlertsDownloaderImpl().then(
  console.log.bind(console),
  console.error.bind(console)
);
