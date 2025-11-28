import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ignore refresh errors and auth routes
    if (
      originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    // If access token expires (401 or 403)
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Push failed requests to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await refreshApi.post("/auth/refresh");

        processQueue(null); // Release waiting requests
        isRefreshing = false;

        return api(originalRequest); // Retry original request
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
