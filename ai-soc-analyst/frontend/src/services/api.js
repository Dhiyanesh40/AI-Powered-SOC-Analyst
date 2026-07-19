import axios from "axios";

// Create an Axios instance that routes requests through the Vite server proxy to the backend
const api = axios.create({
  baseURL: "",
});

/**
 * Uploads a CICIDS2017 CSV file to the backend.
 * @param {File} file - The CSV log file to upload.
 * @returns {Promise<Object>} The server response containing upload metadata.
 */
export const uploadLogs = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("http://127.0.0.1:8000/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const getLatestUpload = async () => {
  const response = await api.get("/api/upload/latest");
  return response.data;
};

/**
 * Initiates ML analysis on an uploaded CSV file.
 * @param {string} filename - The name of the file to analyze.
 * @returns {Promise<Object>} The ML analysis results, including attack distribution.
 */
export const analyzeLogs = async (filename) => {
  const response = await api.post("/api/analyze", { filename });
  return response.data;
};

export default api;
