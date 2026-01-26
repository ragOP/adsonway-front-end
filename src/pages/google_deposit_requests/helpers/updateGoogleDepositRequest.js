import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateGoogleDepositRequest = async ({ id, data }) => {
    try {
        const apiResponse = await apiService({
            endpoint: `${endpoints.updateGoogleDepositRequest}/${id}`,
            method: "PATCH",
            data,
        });

        return apiResponse;
    } catch (error) {
        console.error(error);
        return { response: { success: false, message: error.message } };
    }
};
