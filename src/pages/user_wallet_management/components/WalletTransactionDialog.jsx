import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { modifyUserWallet } from "../helpers/modifyUserWallet";

const WalletTransactionDialog = ({ open, onOpenChange, user, type }) => {
    const queryClient = useQueryClient();
    const isCredit = type === "credit";

    const [formData, setFormData] = useState({
        amount: "",
        transcationId: "",
        paymentMethod: "Manual",
        remarks: "",
    });

    const mutation = useMutation({
        mutationFn: (payload) => modifyUserWallet({ id: user._id, data: payload }),
        onSuccess: (res) => {
            if (res?.response?.success) {
                toast.success(`Wallet ${type}ed successfully!`);
                onOpenChange(false);
                setFormData({ amount: "", transcationId: "", paymentMethod: "Manual", remarks: "" });
                queryClient.invalidateQueries(["adminUsers"]);
            } else {
                toast.error(res?.response?.message || `Failed to ${type} wallet`);
            }
        },
        onError: () => {
            toast.error("An error occurred");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (!formData.transcationId) {
            toast.error("Transaction ID is required");
            return;
        }

        const payload = {
            transcationType: type,
            amount: parseFloat(formData.amount),
            transcationId: formData.transcationId,
            paymentMethod: formData.paymentMethod,
            remarks: formData.remarks || `Admin ${type} adjustment`,
        };

        mutation.mutate(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2 capitalize">
                        {isCredit ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                        {type} User Wallet
                    </DialogTitle>
                    <div className="text-zinc-400 text-sm">
                        Adjusting wallet for <span className="text-white font-medium">{user?.full_name}</span>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">Transaction Type</Label>
                        <Input
                            value={type === "credit" ? "Credit" : "Debit"}
                            disabled
                            className={`bg-zinc-900 border-dashed ${isCredit ? "border-green-500/50 text-green-500" : "border-red-500/50 text-red-500"} w-full cursor-not-allowed capitalize`}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400">Amount ($) <span className="text-red-500">*</span></Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                            className="bg-zinc-900 border-zinc-800 text-white w-full"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400">Transaction ID <span className="text-red-500">*</span></Label>
                        <Input
                            placeholder="TXN"
                            value={formData.transcationId}
                            onChange={(e) => setFormData(prev => ({ ...prev, transcationId: e.target.value }))}
                            className="bg-zinc-900 border-zinc-800 text-white w-full"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400">Payment Method <span className="text-red-500">*</span></Label>
                        <Select
                            value={formData.paymentMethod}
                            disabled={true}
                        >
                            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white w-full opacity-50 cursor-not-allowed">
                                <SelectValue placeholder="Manual" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-zinc-400">Remarks</Label>
                        <Textarea
                            placeholder={`Reason for ${type}...`}
                            value={formData.remarks}
                            onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                            className="bg-zinc-900 border-zinc-800 text-white min-h-[80px] w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className={`${isCredit ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Confirm ${type === 'credit' ? 'Credit' : 'Debit'}`
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default WalletTransactionDialog;
