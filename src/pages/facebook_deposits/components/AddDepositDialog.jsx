import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Loader2, Plus, Receipt, Wallet } from "lucide-react";
import { fetchMyWallet } from "@/components/navbar/helpers/fetchMyWallet";
import { fetchMyAdAccounts } from "@/pages/facebook_ad_accounts/helpers/fetchMyAdAccounts";
import { addMoneyToFacebookAccount } from "../helpers/addMoneyToFacebookAccount";
import { accountAmounts } from "@/pages/facebook_ad_application/constants";

const AddDepositDialog = ({ open, onOpenChange }) => {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        accountId: "",
        amount: "",
        remarks: "",
    });

    const { data: walletData } = useQuery({
        queryKey: ["myWallet"],
        queryFn: fetchMyWallet,
        enabled: open,
    });

    // Fetch Active Facebook Accounts
    const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ["myActiveFacebookAccountsForDeposit"],
        queryFn: () => fetchMyAdAccounts({ params: { status: "active", limit: 100 } }),
        enabled: open,
    });

    const activeAccounts = accountsData?.accounts || [];
    const commissionPercent = walletData?.paymentFeeRule?.facebook_commission || 0;

    const mutation = useMutation({
        mutationFn: (payload) => addMoneyToFacebookAccount({ id: formData.accountId, data: payload }),
        onSuccess: (data) => {
            if (data?.response?.success) {
                toast.success("Deposit request submitted successfully!");
                onOpenChange(false);
                setFormData({ accountId: "", amount: "", remarks: "" });
                queryClient.invalidateQueries(["myFacebookDeposits"]);
                queryClient.invalidateQueries(["myWallet"]);
                queryClient.invalidateQueries(["myFacebookAccounts"]);
            } else {
                toast.error(data?.response?.message || "Failed to submit deposit request");
            }
        },
        onError: () => {
            toast.error("An error occurred");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.accountId) {
            toast.error("Please select an ad account");
            return;
        }
        if (!formData.amount) {
            toast.error("Please select or enter an amount");
            return;
        }

        const payload = {
            amount: parseInt(formData.amount, 10),
            remarks: formData.remarks || "Topup request",
        };

        mutation.mutate(payload);
    };

    const depositAmount = parseFloat(formData.amount) || 0;
    const feeAmount = depositAmount * (commissionPercent / 100);
    const totalAmount = depositAmount + feeAmount;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[600px] max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-zinc-50/50 dark:bg-zinc-950 border-0 shadow-2xl backdrop-blur-xl">
                {/* Header- matching ApplyAdApplicationDialog style */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Wallet className="h-6 w-6" />
                            New Deposit Request
                        </DialogTitle>
                        <p className="text-blue-100 mt-1.5 text-sm">
                            Add funds to your Facebook Ad Account.
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-1 space-y-2">
                                <Label className="font-semibold text-sm">Ad Account</Label>
                                <Select
                                    value={formData.accountId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, accountId: val }))}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-zinc-900 h-11 border-zinc-200 dark:border-zinc-800">
                                        <SelectValue placeholder={isLoadingAccounts ? "Loading..." : "Select Account"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activeAccounts.length > 0 ? (
                                            activeAccounts.map((acc) => (
                                                <SelectItem key={acc._id} value={acc._id}>
                                                    {acc.account_name} ({acc.account_id})
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No active accounts found</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1 space-y-2">
                                <Label className="font-semibold text-sm">Amount ($)</Label>
                                <Select
                                    value={formData.amount}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                                >
                                    <SelectTrigger className="w-full bg-white dark:bg-zinc-900 h-11 border-zinc-200 dark:border-zinc-800">
                                        <SelectValue placeholder="Select Amount" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accountAmounts.map((amt) => (
                                            <SelectItem key={amt.value} value={amt.value.toString()}>
                                                {amt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                    Minimum: $100 | Maximum: $1000 per account | Increment: $50
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Remarks (Optional)</Label>
                            <Textarea
                                placeholder="Enter any specific instructions or notes..."
                                value={formData.remarks}
                                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                                className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 min-h-[100px]"
                            />
                        </div>

                        {/* Payment Summary - Matching ApplyAdApplicationDialog style */}
                        {formData.accountId && (
                            <div className="bg-zinc-900 text-white rounded-xl overflow-hidden shadow-lg mt-8 border border-dashed border-blue-300 dark:border-blue-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Receipt className="w-5 h-5 text-indigo-400" />
                                        <h3 className="font-semibold text-lg">Payment Summary</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm text-zinc-400">
                                            <span>Deposit Amount</span>
                                            <span className="text-white font-medium">${depositAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-zinc-400">
                                            <span>Processing Fee ({commissionPercent}%)</span>
                                            <span className="text-orange-400 font-medium">+ ${feeAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-zinc-700 my-2"></div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Payable</p>
                                            </div>
                                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                                ${totalAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-zinc-950 flex justify-end">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full md:w-auto"
                                        disabled={mutation.isPending}
                                    >
                                        {mutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Confirm & Pay"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AddDepositDialog;
