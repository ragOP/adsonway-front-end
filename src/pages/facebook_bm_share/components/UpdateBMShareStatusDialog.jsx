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
import { Loader2, Edit, User, CreditCard, Calendar, FileText, Share2, Facebook, Shield } from "lucide-react";
import { updateBMShareStatus } from "../helpers/updateBMShareStatus";
import { format } from "date-fns";

const UpdateBMShareStatusDialog = ({ open, onOpenChange, data }) => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (data) {
            setStatus(data.status || "pending");
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateBMShareStatus,
        onSuccess: (res) => {
            if (res?.response?.success === true) {
                toast.success("BM share status updated successfully!");
                onOpenChange(false);
                queryClient.invalidateQueries(["facebookBMShareRequests"]);
            } else {
                toast.error(res?.response?.data?.message || res?.response?.message || "Failed to update status");
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to update status");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            id: data._id,
            status,
        });
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
                                <Facebook className="h-6 w-6 text-blue-100" />
                                BM Share Request Details
                            </div>
                            <Badge variant="secondary" className="capitalize bg-white/20 text-white border-0 hover:bg-white/30">
                                {data.status}
                            </Badge>
                        </DialogTitle>
                        <p className="text-blue-100 text-sm mt-1">
                            Review the BM share application and update its status.
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
                                <p className="text-white font-semibold text-lg">{data.user?.full_name}</p>
                                <p className="text-zinc-400 text-sm">{data.user?.email}</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <Badge variant="outline" className="text-xs bg-zinc-900 border-zinc-700 text-zinc-400">
                                        @{data.user?.username}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Account Card */}
                        <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                            <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                                <Shield className="h-4 w-4 text-purple-500" /> Ad Account
                            </div>
                            <div className="space-y-1 pl-1">
                                <p className="text-white font-semibold text-lg">{data.account?.account_name}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 text-sm">Account ID</span>
                                    <span className="font-mono text-indigo-400 text-sm">{data.account?.account_id}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10 uppercase">
                                        Facebook
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BM Target Card */}
                    <div className="bg-zinc-900/80 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center gap-2">
                            <Share2 className="h-4 w-4 text-sky-500" />
                            <span className="font-semibold text-sm text-zinc-300">Share Information</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Target BM ID</span>
                                <p className="text-lg font-mono font-bold text-white tracking-widest">{data.shared_id}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs text-zinc-500 uppercase tracking-wider">Application Type</span>
                                <p className="text-sm font-medium text-zinc-300 capitalize">
                                    {data.type?.replace("_", " ")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta & Notes */}
                    <div className="space-y-4">
                        {data.notes && (
                            <div className="bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-blue-400 mt-0.5" />
                                    <div className="space-y-1">
                                        <span className="text-sm font-medium text-zinc-200">User Notes</span>
                                        <p className="text-zinc-400 text-sm italic">"{data.notes}"</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-zinc-600 justify-end">
                            <Calendar className="h-3 w-3" /> Requested on {data.createdAt ? format(new Date(data.createdAt), "PPP p") : "N/A"}
                        </div>
                    </div>

                    {/* Action Form */}
                    <form onSubmit={handleSubmit} className="border-t border-zinc-800 pt-6 space-y-5">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Edit className="h-5 w-5 text-indigo-500" />
                            Update Status
                        </h3>

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
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 px-8"
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

export default UpdateBMShareStatusDialog;
