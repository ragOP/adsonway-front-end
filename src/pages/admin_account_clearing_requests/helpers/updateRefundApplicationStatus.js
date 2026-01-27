import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";

export const updateRefundApplicationStatus = async ({ id, data }) => {
    try {
        const response = await apiService({
            endpoint: `${endpoints.updateRefundApplicationStatus}/${id}`,
            method: "PATCH",
            data: { id, ...data },
        });

        return response;
    } catch (error) {
        console.error("Error updating refund status:", error);
        throw error;
    }
};
