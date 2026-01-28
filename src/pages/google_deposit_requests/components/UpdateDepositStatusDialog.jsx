import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Edit, User, CreditCard, Calendar, FileText, Wallet, AlertCircle, ArrowUpRight } from "lucide-react";
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
            if (res?.response?.success === true) {
                toast.success("Deposit status updated successfully!");
                onOpenChange(false);
                queryClient.invalidateQueries(["allGoogleDepositRequests"]);
            } else {
                toast.error(res?.response?.data?.message || res?.response?.message || res?.message || "Failed to update status");
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.message || "Failed to update status");
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
            <DialogContent className="sm:max-w-3xl bg-zinc-950 border-zinc-800 p-0 gap-0 overflow-hidden shadow-2xl">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xl">
                                <Edit className="h-5 w-5 text-blue-200" />
                                Update Deposit Status
                            </div>
                            <Badge variant="secondary" className="capitalize bg-white/20 text-white border-0 hover:bg-white/30">
                                {data.status}
                            </Badge>
                        </DialogTitle>
                        <p className="text-blue-100 text-sm mt-1">
                            Review deposit details and update status.
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Card */}
                        <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <User className="h-4 w-4 text-blue-500" /> User Details
                            </div>
                            <div className="space-y-1 pl-1">
                                <p className="text-white font-semibold text-lg">{data?.userId?.full_name}</p>
                                <p className="text-zinc-400 text-sm">{data?.userId?.email}</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <Badge variant="outline" className="text-xs bg-zinc-900 border-zinc-700 text-zinc-400">
                                        @{data?.userId?.username}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Account Card */}
                        <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <CreditCard className="h-4 w-4 text-purple-500" /> Ad Account
                            </div>
                            <div className="space-y-1 pl-1">
                                <p className="text-white font-semibold text-lg">{data?.accountId?.account_name}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 text-sm">Account ID</span>
                                    <span className="font-mono text-indigo-400 text-sm">{data?.accountId?.account_id}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-400 bg-orange-500/10">
                                        Google
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Card */}
                    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
                            <Wallet className="h-4 w-4 text-emerald-500" />
                            <span className="font-semibold text-sm text-zinc-300">Transaction Details</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Deposited Amount</span>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-white">${data?.amount}</p>
                                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Current Wallet Balance</span>
                                <p className="text-lg font-medium text-zinc-300">
                                    ${data?.walletId?.amount || "0.00"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-4">
                        {data?.remarks && (
                            <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-zinc-200">Remarks</span>
                                        <p className="text-zinc-400 text-sm italic">"{data.remarks}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-zinc-600 justify-end">
                            <Calendar className="h-3 w-3" /> Requested on {data?.createdAt ? format(new Date(data?.createdAt), "PPP p") : "N/A"}
                        </div>
                    </div>

                    {/* Action Form */}
                    <form onSubmit={handleSubmit} className="border-t border-zinc-800 pt-6 space-y-5">
                        <h3 className="text-lg font-semibold text-white">Update Status</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Request Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700">
                                        <SelectItem value="pending" className="text-yellow-400 font-medium">Pending</SelectItem>
                                        <SelectItem value="approved" className="text-emerald-400 font-medium">Approved</SelectItem>
                                        <SelectItem value="rejected" className="text-red-400 font-medium">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {status === "rejected" && (
                                <div className="space-y-2 md:col-span-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-zinc-400">Rejection Reason</Label>
                                    <Textarea
                                        placeholder="Please provide a reason for rejection..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        className="bg-zinc-900 border-zinc-700 text-white min-h-[100px] resize-none focus:ring-indigo-500/20"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateDepositStatusDialog;
