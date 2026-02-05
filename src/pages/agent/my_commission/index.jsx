import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    ResponsiveContainer, LineChart, Line, Area, AreaChart, Tooltip as RechartsTooltip,
    Legend, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';
import NavbarItem from "@/components/navbar/navbar_item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    Users,
    DollarSign,
    Clock,
    CheckCircle2,
    RefreshCw,
    Wallet,
    TrendingDown,
    Info,
    BarChart3,
    ArrowUpRight,
    TrendingUp,
    Eye
} from "lucide-react";
import { fetchMyCommission } from "./helpers/fetchMyCommission";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ViewReportDialog from "./components/ViewReportDialog";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
    warning: '#f97316',
    success: '#22c55e',
    muted: '#6b7280'
};

const CustomTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-950/95 border border-white/10 rounded-lg p-3 shadow-2xl backdrop-blur-sm">
                <p className="text-white font-bold text-sm mb-2">{label}</p>
                {payload.map((pld, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                        <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: pld.color }}
                        />
                        <span className="text-zinc-200">{pld.dataKey}:</span>
                        <span className="text-white font-bold">
                            {formatter ? formatter(pld.value) : pld.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const MonthlyTrendsChart = ({ agentData }) => {
    const chartData = useMemo(() => {
        if (!agentData?.reports || !Array.isArray(agentData.reports)) return [];
        return agentData.reports
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            })
            .map(report => ({
                period: `${format(new Date(2000, report.month - 1, 1), "MMM")} ${report.year}`,
                commission: report.calculatedCommission || 0,
                paid: report.paidAmount || 0,
                pending: report.pendingAmount || 0,
                deposits: report.totalDeposits || 0
            }));
    }, [agentData]);

    if (chartData.length === 0) return null;

    return (
        <Card className="bg-zinc-900/50 border-white/5 overflow-hidden mt-4">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.2em]">
                        Monthly Performance Trends
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="period" stroke="#9ca3af" fontSize={9} />
                            <YAxis stroke="#9ca3af" fontSize={9} />
                            <RechartsTooltip content={<CustomTooltip formatter={formatCurrency} />} />
                            <Area type="monotone" dataKey="deposits" stackId="1" stroke={CHART_COLORS.info} fill={CHART_COLORS.info} fillOpacity={0.1} name="Deposits" />
                            <Bar dataKey="commission" fill={CHART_COLORS.primary} radius={[2, 2, 0, 0]} name="Commission" />
                            <Line type="monotone" dataKey="paid" stroke={CHART_COLORS.secondary} strokeWidth={3} dot={{ r: 4 }} name="Paid" />
                            <Line type="monotone" dataKey="pending" stroke={CHART_COLORS.accent} strokeWidth={2} strokeDasharray="5 5" name="Pending" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

const MetricItem = ({ label, value, icon: Icon, colorClass }) => (
    <div className="flex flex-col gap-1 px-5 py-3 border-r border-white/5 last:border-0 min-w-[140px] max-w-[200px] hover:bg-white/[0.02] transition-colors overflow-hidden">
        <div className="flex items-center gap-2 overflow-hidden">
            {Icon && <Icon className={cn("h-3.5 w-3.5 opacity-80 shrink-0", colorClass)} />}
            <span className="text-[9px] text-zinc-100 font-black uppercase tracking-tight truncate flex-1" title={label}>{label}</span>
        </div>
        <span className="text-base font-black text-white tracking-tight truncate">{formatCurrency(value)}</span>
    </div>
);

const MyCommission = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [viewReportOpen, setViewReportOpen] = useState(false);

    const { data: agentData, isLoading, refetch } = useQuery({
        queryKey: ["myCommission", selectedYear],
        queryFn: () => fetchMyCommission({ year: selectedYear }),
    });

    const processedData = useMemo(() => {
        if (!agentData || !Array.isArray(agentData)) return {
            totalCommission: 0,
            totalPaid: 0,
            totalPending: 0,
            reports: []
        };

        const reports = agentData;
        const totalCommission = reports.reduce((sum, r) => sum + (r.calculatedCommission || 0), 0);
        const totalPaid = reports.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
        const totalPending = reports.reduce((sum, r) => sum + (r.pendingAmount || 0), 0);

        return {
            totalCommission,
            totalPaid,
            totalPending,
            reports: reports.sort((a, b) => b.month - a.month) // Sort reports by month descending
        };
    }, [agentData]);

    const getMonthName = (monthNum) => format(new Date(2000, monthNum - 1, 1), "MMMM");

    const breadcrumbs = [{ title: "Agent", isNavigation: true }, { title: "My Reports", isNavigation: false }];

    return (
        <div className="flex flex-col min-h-screen bg-black text-zinc-100">
            <NavbarItem title="My Commission Report" breadcrumbs={breadcrumbs} />

            <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">My Commission Report</h2>
                        <p className="text-sm text-zinc-400 font-medium tracking-tight">Your financial overview & commission tracking.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setViewReportOpen(true)}
                            className="bg-zinc-900 border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider flex"
                        >
                            <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">View Report</span>
                                <span className="sm:hidden">Report</span>
                            </div>
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => refetch()} className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800">
                            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                        </Button>
                        <div className="w-32">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-0 text-white font-bold">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                    {(() => {
                                        const currentYear = new Date().getFullYear();
                                        const years = [];
                                        for (let y = 2024; y <= currentYear; y++) {
                                            years.push(y.toString());
                                        }
                                        return years.map(year => (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                        ));
                                    })()}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-96 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-zinc-900/50 border-white/5">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Total Commission</p>
                                            <p className="text-xl font-black text-white">{formatCurrency(processedData?.totalCommission)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 border-white/5">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/10">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Total Paid</p>
                                            <p className="text-xl font-black text-emerald-400">{formatCurrency(processedData?.totalPaid)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-zinc-900/50 border-white/5">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-500/10">
                                            <Clock className="h-4 w-4 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Total Pending</p>
                                            <p className="text-xl font-black text-amber-400">{formatCurrency(processedData?.totalPending)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {processedData?.reports?.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-6 bg-primary rounded-full"></div>
                                    <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-[0.2em]">Monthly Performance Analytics</span>
                                </div>

                                <MonthlyTrendsChart agentData={processedData} />

                                <div className="space-y-4">
                                    {processedData.reports.map((report) => (
                                        <Card key={report._id} className="bg-zinc-900/50 border-white/5 overflow-hidden">
                                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5">
                                                {/* Month Info */}
                                                <div className="p-4 min-w-[140px] flex items-center bg-zinc-950/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-white uppercase tracking-wider">{getMonthName(report.month)}</span>
                                                        <span className="text-[10px] text-zinc-300 font-bold">{report.year}</span>
                                                    </div>
                                                </div>

                                                {/* Financial Metrics Group */}
                                                <div className="flex flex-1 flex-wrap items-center overflow-x-auto">
                                                    <MetricItem label="applicationFees" value={report?.applicationFees} />
                                                    <MetricItem label="totalDeposits" value={report?.totalDeposits} icon={ArrowUpRight} colorClass="text-blue-400" />
                                                    <MetricItem label="totalRefunds" value={report?.totalRefunds} icon={TrendingDown} colorClass="text-red-400" />
                                                    <MetricItem label="calculatedCommission" value={report?.calculatedCommission} icon={DollarSign} colorClass="text-primary" />
                                                </div>

                                                {/* Status Balance Group */}
                                                <div className="p-5 bg-zinc-950/40 flex flex-col justify-center min-w-[220px]">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] text-zinc-100 font-black uppercase tracking-[0.1em]">Payment Status</span>
                                                        <Badge className={cn(
                                                            "text-[10px] uppercase font-black h-5 px-2",
                                                            report?.pendingAmount === 0 ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                        )}>
                                                            {report?.pendingAmount === 0 ? "Settled" : "Pending"}
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2.5">
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="text-zinc-200 font-bold uppercase tracking-tighter">paidAmount</span>
                                                            <span className="text-white font-black">{formatCurrency(report?.paidAmount)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[11px]">
                                                            <span className="text-zinc-200 font-bold uppercase tracking-tighter">pendingAmount</span>
                                                            <span className="text-amber-400 font-black">{formatCurrency(report?.pendingAmount)}</span>
                                                        </div>
                                                        <div className="pt-1.5">
                                                            <Progress value={report?.calculatedCommission > 0 ? (report.paidAmount / report.calculatedCommission) * 100 : 0} className="h-1.5 shadow-sm bg-zinc-800" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Payment History Sub-bar */}
                                            {report?.payments?.length > 0 && (
                                                <div className="border-t border-white/5 bg-black/20 p-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        <div className="flex items-center gap-2 mr-4">
                                                            <Info className="h-3 w-3 text-zinc-300" />
                                                            <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-tight">Payments:</span>
                                                        </div>
                                                        {report.payments.map((p) => (
                                                            <div key={p._id} className="flex items-center gap-2 px-2 py-1 rounded bg-zinc-950/50 border border-white/5">
                                                                <span className="text-[10px] font-bold text-emerald-400">{formatCurrency(p?.amount)}</span>
                                                                <span className="text-[9px] text-zinc-300 font-mono italic">{p?.paidAt ? format(new Date(p.paidAt), "dd MMM") : "-"}</span>
                                                                {p?.remarks && (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger className="text-[9px] text-zinc-400 hover:text-white underline underline-offset-2">memo</TooltipTrigger>
                                                                            <TooltipContent className="text-[10px] bg-black border-white/10">{p.remarks}</TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-2xl bg-zinc-900/20">
                                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No historical metrics for this period</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <ViewReportDialog open={viewReportOpen} onClose={() => setViewReportOpen(false)} />
        </div>
    );
};

export default MyCommission;
