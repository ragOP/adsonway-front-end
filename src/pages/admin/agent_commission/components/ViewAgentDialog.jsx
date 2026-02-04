import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Info,
    Calendar,
    RefreshCw,
    DollarSign,
    ArrowUpRight,
    TrendingDown,
    CheckCircle2,
    Clock
} from "lucide-react";
import { apiService } from "@/api/api_service/apiService";
import { endpoints } from "@/api/endpoints";
import { cn } from "@/lib/utils";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

const MetricCard = ({ label, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 space-y-2 hover:bg-zinc-900/80 transition-all duration-200 overflow-hidden min-w-0">
        <div className="flex items-center justify-between gap-2 overflow-hidden">
            <span className="text-[9px] font-black uppercase text-zinc-200 tracking-tight leading-none truncate flex-1" title={label}>
                {label}
            </span>
            <div className="shrink-0">
                {Icon && <Icon className={cn("h-3.5 w-3.5", colorClass)} />}
            </div>
        </div>
        <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight truncate">{formatCurrency(value)}</span>
            {subtitle && <span className="text-[9px] text-zinc-400 font-bold mt-1 truncate">{subtitle}</span>}
        </div>
    </div>
);

const ViewAgentDialog = ({ open, onClose, agentId, agentName }) => {
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const { data: agentDetails, isLoading, refetch } = useQuery({
        queryKey: ["agentDetails", agentId, selectedMonth, selectedYear],
        queryFn: async () => {
            if (!agentId) return null;
            const apiResponse = await apiService({
                endpoint: `${endpoints.viewAgentCommission}/${agentId}`,
                method: "GET",
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                }
            });
            return apiResponse?.response;
        },
        enabled: !!agentId && open,
    });

    const report = useMemo(() => {
        if (!agentDetails || !agentDetails.success) return null;
        return agentDetails.data;
    }, [agentDetails]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[850px] bg-black border-white/10 text-white shadow-2xl">
                <DialogHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                                Monthly Analysis
                            </DialogTitle>
                            <DialogDescription className="text-zinc-200 text-[11px] font-bold tracking-tight mt-1 opacity-90">
                                Detailed financial breakdown for <span className="text-primary">{agentName}</span>
                            </DialogDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[100px] bg-zinc-900 border-white/5 h-9 text-xs font-bold text-white">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    {(() => {
                                        const currentYear = new Date().getFullYear();
                                        const years = [];
                                        for (let y = 2024; y <= currentYear; y++) {
                                            years.push(y.toString());
                                        }
                                        return years.map(y => (
                                            <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                                        ));
                                    })()}
                                </SelectContent>
                            </Select>

                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-[120px] bg-zinc-900 border-white/5 h-9 text-xs font-bold text-white">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10 text-white">
                                    {[...Array(12)].map((_, i) => {
                                        const monthValue = i + 1;
                                        const currentYear = new Date().getFullYear().toString();
                                        const currentMonth = new Date().getMonth() + 1;
                                        const isFutureMonth = selectedYear === currentYear && monthValue > currentMonth;

                                        if (isFutureMonth) return null;

                                        return (
                                            <SelectItem key={monthValue} value={monthValue.toString()} className="text-xs">
                                                {format(new Date(2000, i, 1), "MMMM")}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            <Button variant="outline" size="icon" onClick={() => refetch()} className="h-9 w-9 bg-zinc-900 border-white/5 text-zinc-400 hover:text-white">
                                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Querying Neural Database.</span>
                        </div>
                    ) : report ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Primary Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <MetricCard label="applicationFees" value={report?.applicationFees} icon={Info} colorClass="text-zinc-200" />
                                <MetricCard label="totalDeposits" value={report?.totalDeposits} icon={ArrowUpRight} colorClass="text-emerald-400" />
                                <MetricCard label="totalRefunds" value={report?.totalRefunds} icon={TrendingDown} colorClass="text-red-400" />
                                <MetricCard label="calculatedCommission" value={report?.calculatedCommission} icon={DollarSign} colorClass="text-primary" />
                            </div>

                            {/* Payout & Status Section */}
                            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-1 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-black uppercase text-zinc-100 tracking-widest">Payout Progress</span>
                                            <Badge className={cn(
                                                "text-[10px] font-black uppercase py-0.5 px-2",
                                                report?.pendingAmount === 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            )}>
                                                {report?.pendingAmount === 0 ? "Fully Settled" : "Action Required"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-zinc-300 font-black uppercase tracking-wider">paidAmount</span>
                                                    <span className="text-3xl font-black text-emerald-400 tracking-tighter">{formatCurrency(report?.paidAmount)}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] text-zinc-300 font-black uppercase tracking-wider">Target</span>
                                                    <span className="text-sm font-bold text-zinc-100">{formatCurrency(report?.calculatedCommission)}</span>
                                                </div>
                                            </div>
                                            <Progress value={report?.calculatedCommission > 0 ? (report.paidAmount / report.calculatedCommission) * 100 : 0} className="h-2 bg-zinc-800 shadow-inner" />
                                        </div>
                                    </div>

                                    <div className="hidden md:block w-px bg-white/10"></div>

                                    <div className="w-full md:w-64 space-y-4">
                                        <span className="text-[11px] font-black uppercase text-zinc-100 tracking-widest">outstandingBalance</span>
                                        <div className="flex flex-col p-5 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-xl group hover:border-amber-500/30 transition-all">
                                            <span className="text-3xl font-black text-amber-400 tracking-tighter">{formatCurrency(report?.pendingAmount)}</span>
                                            <span className="text-[10px] text-zinc-200 font-bold mt-1.5 opacity-80">Pending approval and transfer</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transaction Timeline */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-1 w-4 bg-primary rounded-full"></div>
                                    <span className="text-[11px] font-black uppercase text-zinc-100 tracking-[0.2em]">payoutHistory</span>
                                </div>

                                {report?.payments && report.payments.length > 0 ? (
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                        {report.payments.map((p, idx) => (
                                            <div key={p?._id || idx} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-900/60 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-zinc-300 uppercase tracking-widest mb-1">paidAmount</span>
                                                        <span className="text-lg font-black text-white">{formatCurrency(p?.amount)}</span>
                                                        <span className="text-[11px] text-zinc-200 font-bold mt-0.5">{p?.remarks || "No remarks provided"}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[11px] text-zinc-100 font-black uppercase tracking-tight">{p?.paidAt ? format(new Date(p.paidAt), "dd MMM yyyy") : "-"}</span>
                                                    <span className="text-[10px] text-zinc-400 font-mono tracking-tighter uppercase mt-1">TXN_{p?._id ? p._id.slice(-6) : "INT"}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/10">
                                        <Clock className="h-6 w-6 text-zinc-700 mb-2" />
                                        <span className="text-zinc-600 text-[11px] font-bold uppercase tracking-widest italic">No payment transactions recorded for this period</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl bg-zinc-900/10">
                            <Info className="h-8 w-8 text-zinc-700 mb-2" />
                            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic text-center px-10">
                                No statistical data available for the selected period
                            </span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewAgentDialog;
