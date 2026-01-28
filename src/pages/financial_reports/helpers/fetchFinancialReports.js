import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchFinancialReports = async (params) => {
    try {
        const response = await apiService({
            endpoint: endpoints.financialReports,
            method: "GET",
            params,
        });

        if (response?.response?.success) {
            return response.response.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching financial reports:", error);
        return null;
    }
};
