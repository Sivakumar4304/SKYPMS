import api from "./api";

export const adminStudentService = {
    getStudents: (params = {}) =>
        api.get("/api/admin/students", {
            params,
        }),

    getStudentById: (id) =>
        api.get(`/api/admin/students/${id}`),

    deleteStudent: (id) =>
        api.delete(`/api/admin/students/${id}`),
};