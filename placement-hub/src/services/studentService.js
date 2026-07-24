import api from "./api";

export const studentService = {
  fetchResults: (rollNumber) => api.get(`/api/student/results/${rollNumber}`),
  fetchSkills: () => api.get("/api/student/skills"),
  createProfile: (payload) => api.post("/api/student/profile", payload),
  getProfile: () => api.get("/api/student/profile"),
  updateProfile: (payload) => api.patch("/api/student/profile", payload),
  uploadImage: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/student/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
  },
  uploadResume: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/student/profile/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
  },
};
