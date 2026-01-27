import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMyRefundApplications = async (params) => {
    try {
        const response = await apiService({
            endpoint: endpoints.myRefundApplications,
            method: "GET",
            params,
        });

        return response?.response?.data;
    } catch (error) {
        console.error("Error fetching refund applications:", error);
        throw error;
    }
};
