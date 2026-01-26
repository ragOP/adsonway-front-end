import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const addMoneyToGoogleAccount = async ({ id, data }) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.addMoneyToGoogleAccount}/${String(id).trim()}`,
            method: "POST",
            data,
        });

        return apiResponse;
    } catch (error) {
        console.error(error);
        return { response: { success: false, message: error.message } };
    }
};
