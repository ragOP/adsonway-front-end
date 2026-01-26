import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchMyAdAccounts = async ({ params }) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.myFacebookAccounts,
            method: "GET",
            params,
        });

        if (apiResponse?.response?.success) {
            // Check for nested data structure based on recent API response format
            return apiResponse?.response?.data?.data || apiResponse?.response?.data;
        }

        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
};
