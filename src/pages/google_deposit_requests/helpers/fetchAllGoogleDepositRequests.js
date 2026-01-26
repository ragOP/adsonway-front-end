import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const fetchAllGoogleDepositRequests = async ({ params }) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.allGoogleDepositRequests,
            method: "GET",
            params,
        });

        if (apiResponse?.response?.success) {
            return apiResponse?.response?.data;
        }

        return [];
    } catch (error) {
        console.error(error);
        return [];
    }
};
