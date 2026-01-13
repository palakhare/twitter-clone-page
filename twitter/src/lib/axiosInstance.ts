mport axios, { AxiosInstance } from "axios";

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not defined");
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
