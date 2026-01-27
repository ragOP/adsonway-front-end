import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const createRefundApplication = async (data) => {
    try {
        const response = await apiService({
            endpoint: endpoints.createRefundApplication,
            method: "POST",
            data,
        });
        return response;
    } catch (error) {
        console.error("Error creating refund application:", error);
        throw error;
    }
};
