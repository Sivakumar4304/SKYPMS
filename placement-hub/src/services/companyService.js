
import api from "@/services/api";

export const companyService = {
    getAll: async () => {
        const response = await api.get("/api/companies");
        return response.data;
    },

    create: async (data) => {
        const response = await api.post("/api/companies", data);
        return response.data;
    },
};