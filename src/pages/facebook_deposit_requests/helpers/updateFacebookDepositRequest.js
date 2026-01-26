import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateFacebookDepositRequest = async ({ id, data }) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.updateFacebookDepositRequest}/${id}`,
            method: "PATCH",
            data,
        });

        return apiResponse;
    } catch (error) {
        console.error(error);
        return { response: { success: false, message: error.message } };
    }
};
