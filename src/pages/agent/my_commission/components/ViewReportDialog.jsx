import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchMyMonthlyReport } from "../helpers/fetchMyMonthlyReport";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

const ViewReportDialog = ({ open, onClose }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

    // Only refetch when user explicitly clicks a "Search" or automatically when params change? 
    // Let's do auto-fetch for better UX, or a search button if it's heavy. 
    // Given it's a dialog to "view report", auto-fetch on selection change is standard.
    const { data: reportData, isLoading, isError } = useQuery({
        queryKey: ["myMonthlyReport", selectedMonth, selectedYear],
        queryFn: () => fetchMyMonthlyReport({ month: selectedMonth, year: selectedYear }),
        enabled: open, // Only fetch when dialog is open
    });

    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    const availableMonths = useMemo(() => {
        if (selectedYear === currentYear.toString()) {
            return months.filter(m => parseInt(m.value) <= currentMonth);
        }
        return months;
    }, [selectedYear, currentYear, currentMonth]);

    const generateYears = () => {
        const years = [];
        for (let y = 2024; y <= currentYear; y++) {
            years.push(y.toString());
        }
        return years;
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="min-w-[800px] bg-zinc-950 border-white/10 text-white p-0 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-black/80">
                <DialogHeader className="p-6 border-b border-white/5 bg-zinc-900/30">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="h-8 w-1 bg-gradient-to-b from-primary to-blue-600 rounded-full"></div>
                        <div>
                            <h2 className="text-xl font-black uppercase italic tracking-wider text-white">Monthly Commission Report</h2>
                            <p className="text-[10px] text-zinc-400 font-medium tracking-wide">Generate and view your financial performance details</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    <div className="space-y-8">
                        {/* Filters */}
                        <div className="grid grid-cols-2 gap-6 bg-zinc-900/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block ml-1">Select Month</label>
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="bg-black/50 border-white/10 h-11 text-sm font-bold w-full rounded-xl focus:ring-primary/50 transition-all hover:bg-black/70">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white shadow-xl">
                                        {availableMonths.map((m) => (
                                            <SelectItem key={m.value} value={m.value} className="focus:bg-zinc-800 focus:text-white font-medium cursor-pointer">{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block ml-1">Select Year</label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger className="bg-black/50 border-white/10 h-11 text-sm font-bold w-full rounded-xl focus:ring-primary/50 transition-all hover:bg-black/70">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white shadow-xl">
                                        {generateYears().map((y) => (
                                            <SelectItem key={y} value={y} className="focus:bg-zinc-800 focus:text-white font-medium cursor-pointer">{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="min-h-[350px] flex flex-col">
                            {isLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Fetching financial data...</p>
                                </div>
                            ) : reportData ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Report Header info */}
                                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-3xl font-black text-white uppercase italic tracking-tighter loading-none">
                                                    {months.find(m => m.value === selectedMonth)?.label}
                                                </span>
                                                <span className="text-3xl font-thin text-zinc-600 tracking-tighter">
                                                    {selectedYear}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase bg-zinc-900/50 px-2 py-1 rounded inline-block w-fit">ID: {reportData._id || "N/A"}</span>
                                        </div>
                                        <div className={`px-5 py-2 rounded-full border border-dashed flex items-center gap-2 shadow-lg backdrop-blur-md ${reportData.pendingAmount > 0 ? 'bg-amber-500/5 border-amber-500/30 shadow-amber-900/20' : 'bg-emerald-500/5 border-emerald-500/30 shadow-emerald-900/20'}`}>
                                            <div className={`w-2 h-2 rounded-full ${reportData.pendingAmount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${reportData.pendingAmount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {reportData.pendingAmount > 0 ? "Action Required: Pending" : "Status: Settled"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-primary/10 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <MetricCardContent
                                                label="Total Commission Earned"
                                                value={reportData.calculatedCommission}
                                                color="text-primary"
                                                isMain={true}
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-2 bg-zinc-900/20 border border-white/5 rounded-2xl p-4 hover:bg-zinc-900/40 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Application Fees</span>
                                            </div>
                                            <span className="text-2xl font-black text-zinc-200">{formatCurrency(reportData.applicationFees)}</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 bg-zinc-900/20 border border-white/5 rounded-2xl p-4 hover:bg-zinc-900/40 transition-colors">
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Deposits</span>
                                            <span className="text-lg font-black text-blue-400">{formatCurrency(reportData.totalDeposits)}</span>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 bg-zinc-900/20 border border-white/5 rounded-2xl p-4 hover:bg-zinc-900/40 transition-colors">
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block mb-1">Refunds</span>
                                            <span className="text-lg font-black text-rose-400">{formatCurrency(reportData.totalRefunds)}</span>
                                        </div>
                                    </div>

                                    {/* Payment Balance Section */}
                                    <div className="bg-gradient-to-r from-zinc-900 to-black rounded-2xl p-1 border border-white/10 shadow-lg">
                                        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 bg-black/40 rounded-xl">
                                            <div className="flex-1 p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors rounded-l-xl">
                                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    Total Paid
                                                </span>
                                                <span className="text-xl font-black text-emerald-400 font-mono group-hover:scale-105 transition-transform">{formatCurrency(reportData.paidAmount)}</span>
                                            </div>
                                            <div className="flex-1 p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors rounded-r-xl">
                                                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                    Pending Balance
                                                </span>
                                                <span className="text-xl font-black text-amber-400 font-mono group-hover:scale-105 transition-transform">{formatCurrency(reportData.pendingAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Payment History */}
                                    {reportData.payments && reportData.payments.length > 0 && (
                                        <div className="pt-4">
                                            <div className="flex items-center gap-4 mb-6">
                                                <h4 className="text-xs font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                                    Payment History
                                                    <span className="bg-zinc-800 text-zinc-300 text-[9px] px-1.5 py-0.5 rounded font-mono">{reportData.payments.length}</span>
                                                </h4>
                                                <div className="h-px bg-gradient-to-r from-zinc-800 to-transparent flex-1"></div>
                                            </div>

                                            <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-gradient-to-b before:from-zinc-800 before:via-zinc-800 before:to-transparent">
                                                {reportData.payments.map((payment, idx) => (
                                                    <div key={idx} className="relative group">
                                                        <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-black bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform z-10"></div>
                                                        <div className="bg-zinc-900/40 border border-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-zinc-900/60 hover:border-emerald-500/20 transition-all duration-300 group-hover:translate-x-1">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-zinc-200 font-bold text-sm tracking-tight">{payment.remarks || "Wallet Payout"}</span>
                                                                <span className="text-[10px] text-zinc-500 font-mono font-medium flex items-center gap-1">
                                                                    <span className="text-zinc-600">PROCESSED:</span>
                                                                    {format(new Date(payment.paidAt), "MMM dd, yyyy • hh:mm a")}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-emerald-400 font-black font-mono text-base block">{formatCurrency(payment.amount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 min-h-[200px] gap-2">
                                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-dashed border-white/10 mb-2">
                                        <Search className="h-8 w-8 opacity-20" />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">No report generated</p>
                                    <p className="text-[10px] text-zinc-600">Try selecting a different month or year</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const MetricCardContent = ({ label, value, color, isMain }) => (
    <div className={`h-full border border-white/5 rounded-2xl p-5 flex flex-col justify-between ${isMain ? 'bg-zinc-900/60' : 'bg-zinc-900/20'}`}>
        <div className="flex justify-between items-start">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{label}</span>
            {isMain && <div className="p-1.5 rounded bg-primary/20 text-primary animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-current"></div></div>}
        </div>
        <div>
            <span className={`font-black tracking-tighter ${isMain ? "text-4xl text-white drop-shadow-xl" : "text-xl " + color}`}>
                {formatCurrency(value)}
            </span>
            {isMain && <p className="text-[10px] text-zinc-400 mt-1 font-medium">Verified Earnings</p>}
        </div>
    </div>
);

export default ViewReportDialog;
