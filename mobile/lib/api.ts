import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://52.54.148.4",
});

console.log("🔌 API Configured URL:", api.defaults.baseURL);

// Interceptor para logs de requisição
api.interceptors.request.use(async (request) => {
  const token = await AsyncStorage.getItem("@focus:token");
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Starting Request", JSON.stringify(request, null, 2));
  return request;
});

// Interceptor para logs de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(
        "Response Error Data:",
        JSON.stringify(error.response.data, null, 2),
      );
      console.log("Response Status:", error.response.status);
    }
    console.log("Response Error Object:", JSON.stringify(error, null, 2));
    return Promise.reject(error);
  },
);

export default api;
