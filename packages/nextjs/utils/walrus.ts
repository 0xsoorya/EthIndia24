const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

export async function uploadFileToWalrus(inputFile: any) {
  const url = `${PUBLISHER}/v1/store?epochs=5`;

  return fetch(url, {
    method: "PUT",
    body: inputFile,
  }).then(async response => {
    if (response.status === 200) {
      const result = await response.json();
      if (result?.newlyCreated) return result?.newlyCreated?.blobObject?.blobId;
      else if (result.alreadyCertified) return result.alreadyCertified.blobId;
      else return null;
    } else {
      throw new Error("Something went wrong when storing the blob!");
    }
  });
}

export function getFileFromWalrus(blobId: string) {
  return `${AGGREGATOR}/v1/${blobId}`;
}
