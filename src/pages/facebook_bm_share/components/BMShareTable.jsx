import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { fetchBMShareRequests } from "../helpers/fetchBMShareRequests";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getItem } from "@/utils/local_storage";
import UpdateBMShareStatusDialog from "./UpdateBMShareStatusDialog";

import { useCardContext } from "@/context/CardContext";

const BMShareTable = ({ setTotalRecords, params, onPageChange }) => {
    const { isCard } = useCardContext();
    const userRole = getItem("userRole");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const {
        data: dataRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["facebookBMShareRequests", params, isCard],
        queryFn: () => fetchBMShareRequests({ params: { ...params, isCard } }),
    });

    const records = Array.isArray(dataRes?.data) ? dataRes.data : dataRes?.data?.shares || [];
    const apiTotalPages = dataRes?.data?.totalPages || 1;

    useEffect(() => {
        if (setTotalRecords) {
            setTotalRecords(dataRes?.data?.total || records.length);
        }
    }, [records.length, dataRes?.data?.total, setTotalRecords]);

    const handleEdit = (record) => {
        setSelectedRequest(record);
        setEditDialogOpen(true);
    };

    const columns = [
        {
            key: "user",
            label: "Username",
            render: (value) => (
                <div className="flex flex-col gap-1">
                    <Typography variant="p" className="font-medium text-white">
                        {value?.username || "N/A"}
                    </Typography>
                    <Typography className="text-gray-500 text-sm">
                        {value?.email || "N/A"}
                    </Typography>
                </div>
            ),
        },
        {
            key: "user",
            label: "Full Name",
            render: (value) => (
                <Typography className="text-gray-300 text-sm font-medium">
                    {value?.full_name || "N/A"}
                </Typography>
            ),
        },
        {
            key: "account",
            label: "Ad Account",
            render: (value) => (
                <div className="flex flex-col">
                    <Typography className="text-white font-medium text-sm">
                        {value?.account_name || "N/A"}
                    </Typography>
                    <Typography className="text-gray-500 text-xs text-nowrap">
                        {value?.account_id ? `Account ID: ${value.account_id}` : "Account ID: N/A"}
                    </Typography>
                </div>
            ),
        },
        {
            key: "shared_id",
            label: "BM ID",
            render: (value) => (
                <Typography className="text-gray-300 text-sm font-mono">
                    {value || "N/A"}
                </Typography>
            ),
        },
        {
            key: "isCard",
            label: "Mode",
            render: (value) => (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium capitalize ${value ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                    {value ? "Credit Line" : "Card Line"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (value) => (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium capitalize ${value === "approved" ? "bg-green-500/20 text-green-400" :
                    value === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                    }`}>
                    {value || "N/A"}
                </span>
            ),
        },
    ];

    if (userRole === "admin") {
        columns.push({
            key: "actions",
            label: "Actions",
            render: (_, row) => (
                <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-400 transition-colors"
                    onClick={() => handleEdit(row)}
                >
                    <Edit className="w-4 h-4" />
                </Button>
            ),
        });
    }

    return (
        <>
            <CustomTable
                columns={columns}
                data={records}
                isLoading={isLoading}
                error={error}
                emptyStateMessage="No BM share requests found"
                perPage={params.limit}
                currentPage={params.page}
                totalPages={apiTotalPages}
                onPageChange={onPageChange}
            />

            <UpdateBMShareStatusDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                data={selectedRequest}
            />
        </>
    );
};

export default BMShareTable;
