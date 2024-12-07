import axios from "axios";

const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";

export async function uploadFileToWalrus(file: any) {
  const url = `${PUBLISHER}/v1/store?epochs=5`;

  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.put(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
}

export async function getFileFromWalrus(blobId: string) {
  const url = `${AGGREGATOR}/v1/${blobId}`;
  const { data } = await axios.get(url);
  return data;
}
