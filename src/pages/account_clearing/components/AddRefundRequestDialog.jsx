import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, AlertCircle, Receipt, RotateCcw } from "lucide-react";
import { createRefundApplication } from "../helpers/createRefundApplication";
import { toast } from "sonner";
import { fetchMyAdAccounts as fetchFacebookAccounts } from "../../facebook_ad_accounts/helpers/fetchMyAdAccounts";
import { fetchMyAdAccounts as fetchGoogleAccounts } from "../../google_ad_accounts/helpers/fetchMyAdAccounts";
import { fetchMyWallet } from "@/components/navbar/helpers/fetchMyWallet";

const REASONS = [
    "Spending Limits",
    "Restricted / Disabled",
    "Pages Restricted",
    "Underperforming",
    "Other"
];

const AddRefundRequestDialog = ({ open, onOpenChange }) => {
    const queryClient = useQueryClient();

    // Form State
    const [platform, setPlatform] = useState("facebook");
    const [selectedAccountId, setSelectedAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [remarks, setRemarks] = useState("");

    // Fetch Accounts based on platform
    const { data: accountsRaw, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ["myAdAccounts", platform],
        queryFn: () => platform === "facebook" ? fetchFacebookAccounts({ params: {} }) : fetchGoogleAccounts({ params: {} }),
        enabled: open,
    });

    // Fetch Wallet Data for Fee Rules
    const { data: walletData, isLoading: isLoadingWallet } = useQuery({
        queryKey: ["myWallet"],
        queryFn: fetchMyWallet,
        enabled: open,
    });

    // Normalize accounts data
    const accounts = useMemo(() => {
        if (!accountsRaw) return [];
        return Array.isArray(accountsRaw) ? accountsRaw : (accountsRaw.docs || accountsRaw.accounts || []);
    }, [accountsRaw]);

    // Derived Values
    const requestedAmount = parseFloat(amount) || 0;

    // Get Commission Percentage based on platform
    const commissionPercentage = useMemo(() => {
        if (!walletData?.paymentFeeRule) return 0;
        const rule = walletData.paymentFeeRule;
        return platform === "google"
            ? (rule.google_commission || 0)
            : (rule.facebook_commission || 0);
    }, [walletData, platform]);

    const processingFee = requestedAmount * (commissionPercentage / 100);
    // User requested "refund plus fee" logic
    const totalRefund = requestedAmount + processingFee;

    const { mutate, isPending } = useMutation({
        mutationFn: createRefundApplication,
        onSuccess: (res) => {
            if (res?.response?.success === true) {
                toast.success("Refund request submitted successfully");
                queryClient.invalidateQueries(["myRefundApplications"]);
                onOpenChange(false);
                // Reset form
                setAmount("");
                setReason("");
                setRemarks("");
                setSelectedAccountId("");
            } else {
                toast.error(res?.response?.data?.message || res?.response?.message || res?.message || "Failed to submit request");
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.message || "Failed to submit request");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!requestedAmount || requestedAmount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!selectedAccountId) {
            toast.error("Please select an Ad Account");
            return;
        }
        if (!reason) {
            toast.error("Please select a reason");
            return;
        }

        const selectedAccount = accounts.find(acc => acc._id === selectedAccountId || acc.account_id === selectedAccountId);

        // Construct payload strictly matching requirements
        // Note: we combine reason and remarks or keep them separate? 
        // Requirement said: "reason": "Campaign stopped".
        // If remarks are present, we can append them or just use reason.
        // Let's assume reason is the primary field.

        const payload = {
            platform,
            account_name: selectedAccount?.account_name || selectedAccount?.name || "Unknown Account",
            requested_amount: requestedAmount,
            fees_amount: parseFloat(processingFee.toFixed(2)),
            total_refund_amount: parseFloat(totalRefund.toFixed(2)),
            account_id: selectedAccount?.account_id || selectedAccount?._id || "Unknown ID",
            reason: remarks ? `${reason} - ${remarks}` : reason,
        };

        mutate(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[700px] max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-zinc-50/50 dark:bg-zinc-950 border-0 shadow-2xl backdrop-blur-xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            Submit Clearing Request
                        </DialogTitle>
                        <p className="text-blue-100 mt-1.5 text-sm">
                            Enter details to request a refund and clear your ad account balance.
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Platform */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-sm">Platform *</Label>
                            <Select value={platform} onValueChange={(val) => { setPlatform(val); setSelectedAccountId(""); }}>
                                <SelectTrigger className="bg-white dark:bg-zinc-900 h-11 w-full border-zinc-200 dark:border-zinc-800">
                                    <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="google">Google</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ad Account */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-sm">Ad Account *</Label>
                            <Select value={selectedAccountId} onValueChange={setSelectedAccountId} disabled={isLoadingAccounts}>
                                <SelectTrigger className="bg-white dark:bg-zinc-900 h-11 w-full border-zinc-200 dark:border-zinc-800">
                                    {isLoadingAccounts ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="Select account" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts.length > 0 ? (
                                        accounts.map((acc) => (
                                            <SelectItem key={acc._id || acc.account_id} value={acc._id || acc.account_id}>
                                                {acc.account_name || acc.name || acc.account_id}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-center text-muted-foreground">No accounts found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-sm">Requested Amount ($) *</Label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-white dark:bg-zinc-900 h-11 border-zinc-200 dark:border-zinc-800"
                                min="0"
                                step="0.01"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the remaining balance in the ad account that you want cleared and refunded
                            </p>
                        </div>

                        {/* Reason */}
                        <div className="space-y-3">
                            <Label className="font-semibold text-sm">Reason *</Label>
                            <Select value={reason} onValueChange={setReason}>
                                <SelectTrigger className="bg-white dark:bg-zinc-900 h-11 border-zinc-200 dark:border-zinc-800">
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REASONS.map(r => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Remarks */}
                        {reason && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Label className="font-semibold text-sm">
                                    {reason === "Other" ? "Additional Remarks *" : "Additional Remarks (Optional)"}
                                </Label>
                                <Textarea
                                    placeholder={reason === "Other" ? "Please specify the reason..." : "Add any additional information..."}
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 min-h-[100px]"
                                    required={reason === "Other"}
                                />
                            </div>
                        )}

                        {/* Cost Summary Card */}
                        {selectedAccountId && requestedAmount > 0 && (
                            <div className="bg-zinc-900 text-white rounded-xl overflow-hidden shadow-lg mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-dashed border-blue-300 dark:border-blue-700/50">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Receipt className="w-5 h-5 text-indigo-400" />
                                        <h3 className="font-semibold text-lg">Refund Summary</h3>
                                        {isLoadingWallet && <Loader2 className="h-3 w-3 animate-spin text-blue-500 ml-2" />}
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm text-zinc-400">
                                            <span>Requested Amount</span>
                                            <span className="text-white font-medium">${requestedAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-zinc-400">
                                            <span>Processing Fee ({commissionPercentage}%)</span>
                                            <span className="text-orange-400 font-medium">+ ${processingFee.toFixed(2)}</span>
                                        </div>
                                        <div className="h-px bg-zinc-700 my-2"></div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Refund to Wallet</span>
                                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                                                ${totalRefund.toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1 text-right">
                                            Amount credited upon approval
                                        </p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-zinc-950 flex justify-end gap-3">
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
                                        size="lg"
                                        disabled={isPending || isLoadingWallet}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Confirm Request"
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

export default AddRefundRequestDialog;
