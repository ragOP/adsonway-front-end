import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const applyBMShare = async (data) => {
    try {
        const apiResponse = await apiService({
            endpoint: endpoints.applyBMShare,
            method: "POST",
            data,
        });

        if (apiResponse?.response?.success) {
            return { success: true, data: apiResponse.response.data };
        }

        return {
            success: false,
            message: apiResponse?.response?.message || "Something went wrong"
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error?.message || "Something went wrong"
        };
    }
};
