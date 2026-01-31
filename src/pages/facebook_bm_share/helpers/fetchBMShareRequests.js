import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { getItem } from "@/utils/local_storage";

export const fetchBMShareRequests = async ({ params }) => {
    const role = getItem("userRole");
    const endpoint = role === "admin" ? endpoints.allBMShareRequests : endpoints.myBMShareRequests;

    try {
        const apiResponse = await apiService({
            endpoint: endpoint,
            method: "GET",
            params,
        });

        if (apiResponse?.response?.success) {
            return {
                success: true,
                data: apiResponse.response.data
            };
        }

        return {
            success: false,
            message: apiResponse?.response?.message || "Something went wrong"
        };
    } catch (error) {
        console.error("Fetch BM Share Requests Error:", error);
        return {
            success: false,
            message: error?.message || "Something went wrong"
        };
    }
};
