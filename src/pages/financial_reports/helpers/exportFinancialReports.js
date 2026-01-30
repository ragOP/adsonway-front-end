import axios from "axios";
import { getItem } from "@/utils/local_storage";
import { BACKEND_URL } from "@/utils/url";
import { endpoints } from "@/api/endpoints";

export const exportFinancialReports = async (params) => {
    try {
        const token = getItem("token");
        const userRole = getItem("userRole");
        const headers = {
            "ngrok-skip-browser-warning": "true",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let endpoint = endpoints.userExportFinancialReports;

        if (userRole === "admin") {
            endpoint = endpoints.adminExportFinancialReports;
        } else if (userRole === "agent") {
            endpoint = endpoints.agentExportFinancialReports;
        }

        const response = await axios({
            url: `${BACKEND_URL}/${endpoint}`,
            method: "GET",
            params,
            headers,
            responseType: 'blob', // Important for file download
        });

        return response;
    } catch (error) {
        console.error("Error exporting financial reports:", error);
        throw error;
    }
};
