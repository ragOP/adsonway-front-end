import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchRefundApplications = async (params) => {
    try {
        const response = await apiService({
            endpoint: endpoints.getAllRefundApplications,
            method: "GET",
            params,
        });

        return response?.response?.data;
    } catch (error) {
        console.error("Error fetching refund applications:", error);
        throw error;
    }
};
