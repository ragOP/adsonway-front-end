import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyAdAccounts } from "../helpers/fetchMyAdAccounts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Info, Share2, Loader2, Receipt, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { applyBMShare } from "../helpers/applyBMShare";
import { Card, CardContent } from "@/components/ui/card";

const BMShareDialog = ({ open, onOpenChange, initialAccount }) => {
    // Fetch all active accounts for the dropdown
    const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ["myFacebookAccountsForBMShare"],
        queryFn: () => fetchMyAdAccounts({ params: { limit: 1000, sort: -1 } }),
        enabled: open,
    });

    const accounts = accountsData?.accounts || [];
    const availableAccounts = accounts; // Show all accounts as requested

    const [requests, setRequests] = useState([
        { account: "", shared_id: "", notes: "" }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            if (initialAccount) {
                setRequests([{ account: initialAccount._id, shared_id: "", notes: "" }]);
            } else {
                setRequests([{ account: "", shared_id: "", notes: "" }]);
            }
        }
    }, [initialAccount, open]);

    const addRequest = () => {
        if (requests.length >= 5) {
            toast.error("Maximum 5 requests allowed at once");
            return;
        }
        setRequests([...requests, { account: "", shared_id: "", notes: "" }]);
    };

    const removeRequest = (index) => {
        if (requests.length <= 1) return;
        setRequests(requests.filter((_, i) => i !== index));
    };

    const handleRequestChange = (index, field, value) => {
        const newRequests = [...requests];
        newRequests[index][field] = value;
        setRequests(newRequests);
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();

        // Validation
        const isValid = requests.every(req => req.account && req.shared_id);
        if (!isValid) {
            toast.error("Please fill in all required fields for each request");
            return;
        }

        setIsSubmitting(true);
        try {
            // Processing sequentially for better error handling/feedback
            let successCount = 0;
            for (const req of requests) {
                // Find account details to get the account_name and _id for payload
                const accountDetails = accounts.find(a => a._id === req.account);

                const payload = {
                    shared_id: req.shared_id,
                    account: accountDetails?._id, // Internal ID goes into "account" field
                    notes: req.notes,
                };

                const result = await applyBMShare(payload);
                if (result.success) {
                    successCount++;
                } else {
                    toast.error(`Failed for ${req.account}: ${result.message}`);
                }
            }

            if (successCount === requests.length) {
                toast.success("All BM Share requests submitted successfully");
                onOpenChange(false);
            } else if (successCount > 0) {
                toast.success(`${successCount} requests submitted successfully`);
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[700px] max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-zinc-950 border-zinc-800 shadow-2xl backdrop-blur-xl flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Share2 className="h-6 w-6" />
                            Multi BM Share Request
                        </DialogTitle>
                        <p className="text-blue-100 mt-1.5 text-sm">
                            Configure and submit Business Manager share requests for your ad accounts.
                        </p>
                    </DialogHeader>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                    {/* Info Note */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3 animate-in fade-in duration-500">
                        <div className="text-blue-400 mt-0.5">
                            <Info className="w-5 h-5" />
                        </div>
                        <p className="text-blue-200 text-sm leading-relaxed">
                            <span className="font-bold text-blue-100">Pro Tip:</span> You can add up to 5 individual account share requests in a single submission. Our team will process each one for you.
                        </p>
                    </div>

                    <form id="bm-share-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                                    BM Share Details
                                </Label>
                            </div>

                            <div className="space-y-4">
                                {requests.map((req, index) => (
                                    <Card key={index} className="border border-blue-100/10 dark:border-blue-900/10 bg-blue-500/5 overflow-hidden transition-all hover:shadow-md animate-in slide-in-from-top-2 duration-300">
                                        <CardContent className="p-0">
                                            <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                                                <span className="text-xs font-bold text-indigo-400">REQUEST #{index + 1}</span>
                                                {requests.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeRequest(index)}
                                                        className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-zinc-500 uppercase">Ad Account *</Label>
                                                    <Select
                                                        value={req.account}
                                                        onValueChange={(val) => handleRequestChange(index, "account", val)}
                                                    >
                                                        <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 h-11 text-zinc-100">
                                                            <SelectValue placeholder={isLoadingAccounts ? "Loading accounts..." : "Select Ad Account"} />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                                            {availableAccounts.length > 0 ? (
                                                                availableAccounts.map((acc) => (
                                                                    <SelectItem key={acc._id} value={acc._id}>
                                                                        {acc.account_name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="none" disabled>No ad accounts found</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-semibold text-zinc-500 uppercase">Business Manager ID *</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={req.shared_id}
                                                            onChange={(e) => handleRequestChange(index, "shared_id", e.target.value)}
                                                            placeholder="Enter BM ID"
                                                            className="bg-zinc-900 border-zinc-800 h-11 text-zinc-100 placeholder:text-zinc-700"
                                                        />
                                                        {index === requests.length - 1 && (
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                onClick={addRequest}
                                                                className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0 h-11 w-11"
                                                            >
                                                                <Plus className="w-5 h-5" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <Label className="text-xs font-semibold text-zinc-500 uppercase">Notes (Optional)</Label>
                                                    <Input
                                                        value={req.notes}
                                                        onChange={(e) => handleRequestChange(index, "notes", e.target.value)}
                                                        placeholder="Add any additional notes"
                                                        className="bg-zinc-900 border-zinc-800 h-11 text-zinc-100 placeholder:text-zinc-700"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Summary Section */}
                        <div className="bg-zinc-900 text-white rounded-xl overflow-hidden shadow-lg border border-dashed border-zinc-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Receipt className="w-5 h-5 text-indigo-400" />
                                    <h3 className="font-semibold text-lg text-zinc-200">Execution Summary</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm text-zinc-400">
                                        <span>Total requests to process</span>
                                        <span className="text-indigo-400 font-bold">{requests.length} BM Share(s)</span>
                                    </div>
                                    <div className="h-px bg-zinc-800 my-2"></div>
                                    <p className="text-[11px] text-zinc-500 leading-relaxed italic">
                                        By submitting, you agree to allow our system and administrators to process these share requests for your ad accounts. Completion time may vary based on demand.
                                    </p>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-zinc-950 flex justify-end gap-3 border-t border-zinc-800">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => onOpenChange(false)}
                                    className="text-zinc-500 hover:text-white hover:bg-zinc-900 h-11 px-6 font-medium transition-colors"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    form="bm-share-form"
                                    type="submit"
                                    size="lg"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all px-10 h-11"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Submit ${requests.length} Request(s)`
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BMShareDialog;
