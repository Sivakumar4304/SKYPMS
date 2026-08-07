import api from "./api";

export const batchService = {
    getBatches: () =>
        api.get("/api/admin/batches"),

    getStudents: (graduationYear) =>
        api.get(`/api/admin/batches/${graduationYear}/students`),
};