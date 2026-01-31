import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateBMShareStatus = async ({ id, status, adminNote }) => {
    try {
        const payload = {
            status,
        };

        const response = await apiService({
            endpoint: `${endpoints.updateBMShareStatus}/${id}`,
            method: "PATCH",
            data: payload,
        });

        return response;
    } catch (error) {
        console.error("Error updating BM share status:", error);
        throw error;
    }
};
