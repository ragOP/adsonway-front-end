import axios from "axios";
import { getItem } from "@/utils/local_storage";
import { BACKEND_URL } from "@/utils/url";
import { endpoints } from "@/api/endpoints";

export const exportFinancialReports = async (params) => {
    try {
        const token = getItem("token");
        const headers = {
            "ngrok-skip-browser-warning": "true",
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios({
            url: `${BACKEND_URL}/${endpoints.exportFinancialReports}`,
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
