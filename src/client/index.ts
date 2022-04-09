import axios from "axios";
import JSONBigInt from "json-bigint";

const instance = axios.create({
  timeout: 10000,
  headers: { "content-type": "application/json" },
  baseURL: "https://api.tzkt.io/v1/",
  transformResponse: [
    (data) => JSONBigInt({ storeAsString: true }).parse(data),
  ],
});

export default instance;
