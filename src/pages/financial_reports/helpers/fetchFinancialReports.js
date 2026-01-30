import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { getItem } from "@/utils/local_storage";

export const fetchFinancialReports = async (params) => {
    try {
        const userRole = getItem("userRole");
        let endpoint = endpoints.userFinancialReports;

        if (userRole === "admin") {
            endpoint = endpoints.adminFinancialReports;
        } else if (userRole === "agent") {
            endpoint = endpoints.agentFinancialReports;
        }

        const response = await apiService({
            endpoint,
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
