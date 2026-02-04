import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const adjustPlatformFee = async (platformFee) => {
    try {
        const response = await apiService({
            endpoint: endpoints.adjustPlatformFee,
            method: "POST",
            data: { platform_fee: platformFee },
        });

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
