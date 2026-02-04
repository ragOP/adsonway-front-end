import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchAgentCommissions = async ({ year }) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.agentCommission,
            method: "GET",
            params: { year },
        });

        if (apiResponse?.response?.success) {
            return apiResponse?.response?.data;
        }

        return [];
    } catch (error) {
        console.error("Error fetching agent commissions:", error);
        return [];
    }
};
