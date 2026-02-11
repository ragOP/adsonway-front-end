import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { fetchAllFacebookDepositRequests } from "../helpers/fetchAllFacebookDepositRequests";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import UpdateDepositStatusDialog from "./UpdateDepositStatusDialog";

const DepositRequestsTable = ({ setTotalRecords, params, onPageChange }) => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

    const {
        data: dataRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["allFacebookDepositRequests", params],
        queryFn: () => fetchAllFacebookDepositRequests({ params }),
    });

    const records = dataRes?.requests || [];
    const totalRecordsCount = dataRes?.requests?.length || 0;
    const apiTotalPages = dataRes?.totalPages || 1;

    useEffect(() => {
        if (setTotalRecords) {
            setTotalRecords(totalRecordsCount);
        }
    }, [totalRecordsCount, setTotalRecords]);

    const handleEdit = (request) => {
        setSelectedRequest(request);
        setIsUpdateDialogOpen(true);
    };

    const columns = [
        {
            key: "createdAt",
            label: "Date",
            render: (value) => (
                <Typography className="text-gray-400 text-xs">
                    {value ? format(new Date(value), "PPP p") : "N/A"}
                </Typography>
            ),
        },
        {
            key: "userId",
            label: "User",
            render: (value) => (
                <div className="flex flex-col">
                    <Typography className="text-gray-300 text-sm font-medium">
                        {value?.username || "N/A"}
                    </Typography>
                    <Typography className="text-gray-500 text-xs">
                        {value?.email || ""}
                    </Typography>
                </div>
            ),
        },
        {
            key: "accountId",
            label: "Ad Account",
            render: (value) => (
                <div className="flex flex-col">
                    <Typography className="text-gray-300 text-sm font-medium">
                        {value?.account_name || "N/A"}
                    </Typography>
                    <Typography className="text-gray-500 text-xs">
                        {value?.account_id || ""}
                    </Typography>
                </div>
            ),
        },
        {
            key: "amount",
            label: "Amount",
            render: (value) => (
                <Typography className="text-white font-medium text-sm">
                    ${value || "0"}
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
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium capitalize ${value === "approved" || value === "completed" || value === "success" ? "bg-green-500/20 text-green-400" :
                    value === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                    }`}>
                    {value || "N/A"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Action",
            render: (_, row) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(row)}
                    className="h-8 w-8 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20"
                >
                    <Edit className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <>
            <CustomTable
                columns={columns}
                data={records}
                isLoading={isLoading}
                error={error}
                emptyStateMessage="No deposit requests found"
                perPage={params.limit}
                currentPage={params.page}
                totalPages={apiTotalPages}
                onPageChange={onPageChange}
            />

            <UpdateDepositStatusDialog
                open={isUpdateDialogOpen}
                onOpenChange={setIsUpdateDialogOpen}
                data={selectedRequest}
            />
        </>
    );
};

export default DepositRequestsTable;
