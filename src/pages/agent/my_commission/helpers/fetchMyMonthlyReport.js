import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMyMonthlyReport = async ({ month, year }) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.mySingleAgentCommissionReport,
            method: "GET",
            params: { month, year },
        });

        if (apiResponse?.response?.success) {
            return apiResponse?.response?.data;
        }

        return null;
    } catch (error) {
        console.error("Error fetching my monthly commission report:", error);
        return null;
    }
};
