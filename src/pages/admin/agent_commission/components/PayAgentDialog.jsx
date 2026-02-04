import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, DollarSign, CheckCircle2, Calendar, MessageSquare, Wallet } from "lucide-react";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { cn } from "@/lib/utils";

const PayAgentDialog = ({ open, onClose, agentId, agentName, agentData }) => {
    const queryClient = useQueryClient();
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const totalPending = agentData?.totalPending || 0;

    useEffect(() => {
        if (open && totalPending > 0) {
            setAmount(totalPending.toFixed(2));
        }
    }, [open, totalPending]);

    const mutation = useMutation({
        mutationFn: async (payload) => {
            const response = await apiService({
                endpoint: `${endpoints.payAgentCommission}/${agentId}/pay`,
                method: "POST",
                data: payload,
            });
            return response?.response;
        },
        onSuccess: (data) => {
            if (data?.success) {
                toast.success(data?.message || "Payment recorded successfully", {
                    className: "bg-black border-emerald-500/20 text-emerald-400 font-bold",
                });
                queryClient.invalidateQueries(["agentCommissions"]);
                queryClient.invalidateQueries(["agentDetails", agentId]);
                handleClose();
            } else {
                toast.error(data?.message || "Failed to record payment", {
                    className: "bg-black border-red-500/20 text-red-400 font-bold",
                });
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Internal Server Error", {
                className: "bg-black border-red-500/20 text-red-400 font-bold",
            });
        },
    });

    const handleClose = () => {
        setAmount("");
        setRemarks("");
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const inputAmount = parseFloat(amount);

        if (!amount || isNaN(amount) || inputAmount <= 0) {
            return toast.error("Please enter a valid amount", {
                className: "bg-black border-red-500/20 text-red-400 font-bold",
            });
        }

        if (inputAmount > totalPending) {
            return toast.error(`Amount cannot exceed total pending: $${totalPending.toFixed(2)}`, {
                className: "bg-black border-red-500/20 text-red-400 font-bold",
            });
        }

        mutation.mutate({
            month: parseInt(selectedMonth),
            year: parseInt(selectedYear),
            amount: inputAmount,
            remarks: remarks || `Payout for ${format(new Date(2000, parseInt(selectedMonth) - 1), "MMMM")} ${selectedYear}`,
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-black border-white/10 text-white shadow-2xl p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-8">
                        <DialogHeader className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Wallet className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">
                                        Process Payout
                                    </DialogTitle>
                                    <DialogDescription className="text-zinc-400 text-xs font-bold tracking-tight mt-1">
                                        Record commission settlement for <span className="text-zinc-100">{agentName}</span>
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Target Year</Label>
                                    </div>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger className="bg-zinc-900 border-white/5 h-11 text-sm font-bold text-white focus:ring-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                            {(() => {
                                                const currentYear = new Date().getFullYear();
                                                const years = [];
                                                for (let y = 2024; y <= currentYear; y++) {
                                                    years.push(y.toString());
                                                }
                                                return years.map(y => (
                                                    <SelectItem key={y} value={y} className="text-sm font-bold">{y}</SelectItem>
                                                ));
                                            })()}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Target Month</Label>
                                    </div>
                                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                        <SelectTrigger className="bg-zinc-900 border-white/5 h-11 text-sm font-bold text-white focus:ring-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                            {[...Array(12)].map((_, i) => {
                                                const monthValue = i + 1;
                                                const currentYear = new Date().getFullYear().toString();
                                                const currentMonth = new Date().getMonth() + 1;
                                                const isFutureMonth = selectedYear === currentYear && monthValue > currentMonth;

                                                if (isFutureMonth) return null;

                                                return (
                                                    <SelectItem key={monthValue} value={monthValue.toString()} className="text-sm font-bold">
                                                        {format(new Date(2000, i, 1), "MMMM")}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Settlement Amount</Label>
                                    </div>
                                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.1em] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        Max Payable: ${totalPending.toFixed(2)}
                                    </span>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-400 transition-colors font-bold">$</div>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="bg-zinc-900 border-white/5 pl-8 h-12 text-base font-bold text-white focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Internal Remarks</Label>
                                </div>
                                <Textarea
                                    placeholder="Add payment notes or reference IDs..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    className="bg-zinc-900 border-white/5 min-h-[100px] text-sm font-medium text-white resize-none focus-visible:ring-primary/20"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="bg-zinc-950/50 p-6 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="text-zinc-400 hover:text-white font-bold h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest px-8 h-11 shadow-lg shadow-emerald-600/20"
                        >
                            {mutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Finalize Payout
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PayAgentDialog;
