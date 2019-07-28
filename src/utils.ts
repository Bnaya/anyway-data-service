// @ts-ignore
import * as kms from "@google-cloud/kms";

export function imAUtil() {
  return "Some Value";
}

export async function decrypt(ciphertext: string) {
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
