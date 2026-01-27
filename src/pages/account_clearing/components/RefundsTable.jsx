import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomTable from "@/components/custom_table";
import Typography from "@/components/typography";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { fetchMyRefundApplications } from "../helpers/fetchMyRefundApplications";

const RefundsTable = ({ setTotalRefunds, params, onPageChange }) => {
    const {
        data: refundsRes,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["myRefundApplications", params],
        queryFn: () => fetchMyRefundApplications(params),
    });

    const refunds = refundsRes?.userRefundApplications || refundsRes?.docs || [];
    const totalRefunds = refundsRes?.totalDocs || refunds.length || 0;
    const apiTotalPages = refundsRes?.totalPages || 1;

    useEffect(() => {
        if (setTotalRefunds) {
            setTotalRefunds(totalRefunds);
        }
    }, [totalRefunds, setTotalRefunds]);

    const columns = [
        {
            key: "createdAt",
            label: "Date",
            render: (value) => (
                <div className="flex flex-col gap-1">
                    <Typography className="text-sm">
                        {value ? format(new Date(value), "dd/MM/yyyy") : "N/A"}
                    </Typography>
                    <Typography className="text-gray-500 text-xs text-nowrap">
                        {value ? format(new Date(value), "hh:mm a") : ""}
                    </Typography>
                </div>
            ),
        },
        {
            key: "platform",
            label: "Platform",
            render: (value) => (
                <span className="capitalize font-medium text-sm">
                    {value || "—"}
                </span>
            ),
        },
        {
            key: "account_name",
            label: "Ad Account",
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{row.account_name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground font-mono">{row.account_id || "—"}</span>
                </div>
            ),
        },
        {
            key: "requested_amount",
            label: "Requested",
            render: (value) => (
                <span className="text-sm">
                    ${parseFloat(value || 0).toFixed(2)}
                </span>
            ),
        },
        {
            key: "fees_amount",
            label: "Fee",
            render: (value) => (
                <span className="text-sm text-orange-600 dark:text-orange-400">
                    +${parseFloat(value || 0).toFixed(2)}
                </span>
            ),
        },
        {
            key: "total_refund_amount",
            label: "Total Refund",
            render: (value) => (
                <span className="font-bold text-green-600 dark:text-green-400">
                    ${parseFloat(value || 0).toFixed(2)}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (value) => {
                const getStatusColor = (status) => {
                    switch (status?.toLowerCase()) {
                        case "approved":
                            return "bg-green-500/10 text-green-500 border-green-500/20";
                        case "rejected":
                            return "bg-red-500/10 text-red-500 border-red-500/20";
                        case "pending":
                            return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
                        default:
                            return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
                    }
                };
                return (
                    <Badge variant="outline" className={`${getStatusColor(value)} capitalize`}>
                        {value || "Unknown"}
                    </Badge>
                );
            },
        },
        {
            key: "reason",
            label: "Reason",
            render: (value, row) => (
                <div className="flex flex-col max-w-[200px]">
                    <span className="text-sm truncate" title={value}>{value}</span>
                    {row.remarks && (
                        <span className="text-xs text-muted-foreground truncate" title={row.remarks}>
                            {row.remarks}
                        </span>
                    )}
                </div>
            ),
        },
    ];

    return (
        <CustomTable
            columns={columns}
            data={refunds}
            isLoading={isLoading}
            error={error}
            emptyStateMessage="No refund applications found"
            perPage={params.per_page}
            currentPage={params.page}
            totalPages={apiTotalPages}
            onPageChange={onPageChange}
        />
    );
};

export default RefundsTable;
