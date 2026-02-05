import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMyCommission = async ({ year }) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.myAgentCommission,
            method: "GET",
            params: { year },
        });

        if (apiResponse?.response?.success) {
            return apiResponse?.response?.data;
        }

        return null;
    } catch (error) {
        console.error("Error fetching my commission:", error);
        return null;
    }
};
