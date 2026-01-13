import axios, { AxiosInstance } from "axios";

// Ensure BACKEND_URL is defined
const baseURL = process.env.BACKEND_URL;
if (!baseURL) {
  throw new Error("BACKEND_URL is not defined in environment variables");
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
