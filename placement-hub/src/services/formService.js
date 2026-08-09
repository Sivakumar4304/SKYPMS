import api from "./api";

export const formService = {
    getById: (id) => api.get(`/api/forms/${id}`),

    getByDrive: (driveId) =>
        api.get(`/api/forms/drive/${driveId}`),

    create: (payload) =>
        api.post("/api/forms", payload),

    update: (id, payload) =>
        api.put(`/api/forms/${id}`, payload),

    publish: (id) =>
        api.put(`/api/forms/${id}/publish`),

    close: (id) =>
        api.put(`/api/forms/${id}/close`),

    remove: (id) =>
        api.delete(`/api/forms/${id}`),

    submit: (id, payload) =>
        api.post(`/api/forms/${id}/submit`, payload),
};