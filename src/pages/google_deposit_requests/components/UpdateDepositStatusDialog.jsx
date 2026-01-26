import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Edit, User, CreditCard, Calendar, FileText, Wallet } from "lucide-react";
import { updateGoogleDepositRequest } from "../helpers/updateGoogleDepositRequest";
import { format } from "date-fns";

const UpdateDepositStatusDialog = ({ open, onOpenChange, data }) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        if (data) {
            setStatus(data.status || "pending");
            setRejectReason(data.rejectReason || "");
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: (payload) => updateGoogleDepositRequest({ id: data._id, data: payload }),
        onSuccess: (res) => {
            if (res?.response?.success) {
                toast.success("Deposit status updated successfully!");
                onOpenChange(false);
                queryClient.invalidateQueries(["allGoogleDepositRequests"]);
            } else {
                toast.error(res?.response?.message || "Failed to update status");
            }
        },
        onError: () => {
            toast.error("An error occurred");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            status,
        };
        if (status === "rejected") {
            if (!rejectReason) {
                toast.error("Please provide a rejection reason");
                return;
            }
            payload.reject_reason = rejectReason;
        }

        mutation.mutate(payload);
    };

    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                        <Edit className="h-5 w-5 text-indigo-500" />
                        Update Deposit Status
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 bg-zinc-900/50 p-4 rounded-lg border border-zinc-800/50">
                    <div className="col-span-2 md:col-span-1 space-y-1">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                            <User className="h-3 w-3" /> User Details
                        </div>
                        <p className="text-white font-medium">{data?.userId?.full_name}</p>
                        <p className="text-zinc-400 text-sm">{data?.userId?.email}</p>
                        <p className="text-zinc-500 text-xs">@{data?.userId?.username}</p>
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-1">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                            <CreditCard className="h-3 w-3" /> Account Info
                        </div>
                        <p className="text-white font-medium">{data?.accountId?.account_name}</p>
                        <p className="text-indigo-400 text-sm font-mono">ID: {data?.accountId?._id}</p>
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                            <Wallet className="h-3 w-3" /> Transaction
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white">${data?.amount}</span>
                            <span className="text-zinc-500 text-xs">Requested</span>
                        </div>
                        {data?.walletId && (
                            <p className="text-zinc-500 text-xs mt-1">
                                Current Wallet Balance: <span className="text-green-400">${data?.walletId?.amount}</span>
                            </p>
                        )}
                    </div>

                    <div className="col-span-2 md:col-span-1 space-y-1 mt-2">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                            <Calendar className="h-3 w-3" /> Created At
                        </div>
                        <p className="text-zinc-300 text-sm">
                            {data?.createdAt ? format(new Date(data?.createdAt), "PPP p") : "N/A"}
                        </p>
                    </div>

                    {data?.remarks && (
                        <div className="col-span-2 space-y-1 mt-2 pt-2 border-t border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <FileText className="h-3 w-3" /> Remarks
                            </div>
                            <p className="text-zinc-300 text-sm italic">"{data.remarks}"</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="pending" className="text-yellow-400">Pending</SelectItem>
                                <SelectItem value="approved" className="text-green-400">Approved</SelectItem>
                                <SelectItem value="rejected" className="text-red-400">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {status === "rejected" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label className="text-zinc-400">Rejection Reason</Label>
                            <Textarea
                                placeholder="Why is this request being rejected?"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="bg-zinc-900 border-zinc-800 text-white min-h-[100px]"
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Update Status"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateDepositStatusDialog;
