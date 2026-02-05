import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

console.log("🔌 API Configured URL:", process.env.EXPO_PUBLIC_API_URL);

// Interceptor para logs de requisição
api.interceptors.request.use((request) => {
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
