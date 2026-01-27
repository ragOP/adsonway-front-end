import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Edit, User, CreditCard, Calendar, FileText, Receipt, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { updateRefundApplicationStatus } from "../helpers/updateRefundApplicationStatus";
import { format } from "date-fns";

const UpdateRefundStatusDialog = ({ open, onOpenChange, data }) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState("");
    const [adminNotes, setAdminNotes] = useState("");

    // Amount states
    const [requestedAmount, setRequestedAmount] = useState("");
    const [feesAmount, setFeesAmount] = useState(0);
    const [totalRefundAmount, setTotalRefundAmount] = useState(0);
    const [feePercentage, setFeePercentage] = useState(0);

    const isApproved = data?.status === "approved" || data?.status === "processed";

    useEffect(() => {
        if (data) {
            setStatus(data.status || "pending");
            setAdminNotes(data.admin_notes || "");

            const req = parseFloat(data.requested_amount || 0);
            const fee = parseFloat(data.fees_amount || 0);
            const total = parseFloat(data.total_refund_amount || 0);

            setRequestedAmount(req);
            setFeesAmount(fee);
            setTotalRefundAmount(total);

            if (req > 0) {
                setFeePercentage(fee / req);
            } else {
                setFeePercentage(0);
            }
        }
    }, [data]);

    const handleAmountChange = (e) => {
        const valStr = e.target.value;
        setRequestedAmount(valStr);

        const val = parseFloat(valStr);
        if (!isNaN(val)) {
            // Calculate new fee and total based on initial percentage
            const newFee = val * feePercentage;
            const newTotal = val + newFee;
            setFeesAmount(parseFloat(newFee.toFixed(2)));
            setTotalRefundAmount(parseFloat(newTotal.toFixed(2)));
        } else {
            setFeesAmount(0);
            setTotalRefundAmount(0);
        }
    };

    const mutation = useMutation({
        mutationFn: (payload) => updateRefundApplicationStatus({ id: data._id, data: payload }),
        onSuccess: (res) => {
            if (res?.response?.success === true) {
                toast.success("Refund status updated successfully!");
                onOpenChange(false);
                queryClient.invalidateQueries(["allRefundApplications"]);
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
            admin_notes: adminNotes,
            requested_amount: parseFloat(requestedAmount),
            fees_amount: feesAmount,
            total_refund_amount: totalRefundAmount,
        };
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
                                Update Refund Request
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="capitalize bg-white/20 text-white border-0 hover:bg-white/30">
                                    {data.status}
                                </Badge>
                            </div>
                        </DialogTitle>
                        <p className="text-blue-100 text-sm mt-1">
                            Review, edit amounts if necessary, and update the status.
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                    {/* Top Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Card */}
                        <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <User className="h-4 w-4 text-blue-500" /> Requester Info
                            </div>
                            <div className="space-y-1 pl-1">
                                <p className="text-white font-semibold text-lg">{data?.user?.full_name}</p>
                                <p className="text-zinc-400 text-sm">{data?.user?.email}</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <Badge variant="outline" className="text-xs bg-zinc-900 border-zinc-700 text-zinc-400">
                                        @{data?.user?.username}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Account Card */}
                        <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <CreditCard className="h-4 w-4 text-purple-500" /> Ad Account Details
                            </div>
                            <div className="space-y-1 pl-1">
                                <p className="text-white font-semibold text-lg">{data?.account_name}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 text-sm">Platform</span>
                                    <span className="capitalize text-white font-medium">{data?.platform}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 text-sm">Account ID</span>
                                    <span className="font-mono text-indigo-400 text-sm">{data?.account_id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary (Editable) */}
                    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-emerald-500" />
                                <span className="font-semibold text-sm text-zinc-300">Financial Breakdown (Auto-Calculated)</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-700">
                                Fee Rate: {(feePercentage * 100).toFixed(1)}%
                            </Badge>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Requested ($)</Label>
                                <Input
                                    type="number"
                                    value={requestedAmount}
                                    onChange={handleAmountChange}
                                    disabled={isApproved}
                                    className="bg-zinc-950 border-zinc-700 text-white font-medium focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Fee ($)</Label>
                                <div className="h-10 flex items-center px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-orange-500 font-medium opacity-80">
                                    +{feesAmount}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Total Refund ($)</Label>
                                <div className="h-10 flex items-center px-3 rounded-md border border-zinc-800 bg-zinc-900/50 text-emerald-500 font-bold text-lg opacity-80">
                                    ${totalRefundAmount}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason & Remarks Section */}
                    <div className="space-y-4">
                        <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                                <div className="space-y-1">
                                    <span className="text-sm font-medium text-zinc-200">Reason for Refund</span>
                                    <p className="text-zinc-400 text-sm">{data?.reason}</p>
                                </div>
                            </div>
                        </div>

                        {data?.remarks && (
                            <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-zinc-200">User Remarks</span>
                                        <p className="text-zinc-400 text-sm italic">"{data.remarks}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-zinc-600 justify-end">
                            <Calendar className="h-3 w-3" /> Submitted on {data?.createdAt ? format(new Date(data?.createdAt), "PPP p") : "N/A"}
                        </div>
                    </div>

                    {/* Action Form */}
                    <form onSubmit={handleSubmit} className="border-t border-zinc-800 pt-6 space-y-5">
                        <h3 className="text-lg font-semibold text-white">Update Status</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Application Status</Label>
                                <Select value={status} onValueChange={setStatus} disabled={isApproved}>
                                    <SelectTrigger className="bg-zinc-900 border-zinc-700 text-white h-11 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-700">
                                        <SelectItem value="pending" className="text-yellow-400 font-medium">Pending</SelectItem>
                                        <SelectItem value="approved" className="text-emerald-400 font-medium">Approved</SelectItem>
                                        <SelectItem value="rejected" className="text-red-400 font-medium">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-zinc-400">Admin Notes (Reference)</Label>
                                <Textarea
                                    placeholder="Add internal notes about this decision..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    disabled={isApproved}
                                    className="bg-zinc-900 border-zinc-700 text-white min-h-[100px] resize-none focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="text-zinc-400 hover:text-white"
                            >
                                Close
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending || isApproved}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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

export default UpdateRefundStatusDialog;
