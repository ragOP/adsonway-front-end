import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const getConfig = async () => {
    try {
        const response = await apiService({
            endpoint: endpoints.getConfig,
            method: "GET",
        });

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
