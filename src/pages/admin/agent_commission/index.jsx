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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Users,
    DollarSign,
    Clock,
    CheckCircle2,
    Search,
    RefreshCw,
    Eye,
    Wallet,
    Calendar,
    ArrowUpRight,
    TrendingDown,
    Info,
    BarChart3,
    PieChart as PieChartIcon,
    TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchAgentCommissions } from "./helpers/fetchAgentCommissions";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ViewAgentDialog from "./components/ViewAgentDialog";
import PayAgentDialog from "./components/PayAgentDialog";

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

const SummaryCard = ({ title, value, icon: Icon, color, bg, isLoading }) => {
    return (
        <Card className="group relative overflow-hidden bg-zinc-900 border-white/5 hover:border-white/10 transition-all duration-300 shadow-xl">
            <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${bg} blur-2xl opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
                <CardTitle className="text-[10px] font-black text-zinc-100 uppercase tracking-[0.2em]">{title}</CardTitle>
                <div className={`p-1.5 rounded-lg ${bg} ${color}`}>
                    {Icon && <Icon className="h-4 w-4" />}
                </div>
            </CardHeader>
            <CardContent className="z-10 relative">
                <div className="text-3xl font-black text-white tracking-tighter italic">
                    {isLoading ? <div className="h-10 w-32 bg-zinc-800 animate-pulse rounded"></div> : value}
                </div>
            </CardContent>
        </Card>
    );
};

const CommissionDistributionChart = ({ agentsData, isLoading }) => {
    const chartData = useMemo(() => {
        if (!agentsData || !Array.isArray(agentsData)) return [];
        return agentsData
            .filter(agent => agent.totalCommission > 0)
            .sort((a, b) => b.totalCommission - a.totalCommission)
            .slice(0, 8)
            .map((agent, index) => ({
                name: agent.agent.name,
                value: agent.totalCommission,
                fill: [
                    CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent,
                    CHART_COLORS.info, CHART_COLORS.warning, CHART_COLORS.success,
                    CHART_COLORS.danger, CHART_COLORS.muted
                ][index]
            }));
    }, [agentsData]);

    if (isLoading) {
        return (
            <div className="h-80 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Card className="bg-zinc-900/50 border-white/5 shadow-2xl">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-[11px] font-black text-zinc-100 uppercase tracking-[0.2em]">
                        Commission Distribution
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={40}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0];
                                        return (
                                            <div className="bg-zinc-950/95 border border-white/10 rounded-lg p-3 shadow-2xl">
                                                <p className="text-white font-bold text-sm">{data.payload.name}</p>
                                                <p className="text-zinc-200 text-xs">
                                                    Commission: <span className="text-white font-bold">{formatCurrency(data.value)}</span>
                                                </p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend 
                                wrapperStyle={{ fontSize: '10px', color: '#e4e4e7' }}
                                formatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

const PaymentEfficiencyChart = ({ agentsData, isLoading }) => {
    const chartData = useMemo(() => {
        if (!agentsData || !Array.isArray(agentsData)) return [];
        return agentsData
            .filter(agent => (agent.totalPaid + agent.totalPending) > 0)
            .sort((a, b) => {
                const aEfficiency = a.totalPaid / (a.totalPaid + a.totalPending);
                const bEfficiency = b.totalPaid / (b.totalPaid + b.totalPending);
                return bEfficiency - aEfficiency;
            })
            .slice(0, 6)
            .map((agent, index) => {
                const total = agent.totalPaid + agent.totalPending;
                const efficiency = total > 0 ? (agent.totalPaid / total) * 100 : 0;
                return {
                    name: agent.agent.name.length > 8 ? agent.agent.name.substring(0, 8) + '...' : agent.agent.name,
                    efficiency: efficiency,
                    paid: agent.totalPaid || 0,
                    pending: agent.totalPending || 0,
                    total: total,
                    fill: efficiency >= 80 ? CHART_COLORS.success : 
                          efficiency >= 60 ? CHART_COLORS.warning : 
                          efficiency >= 40 ? CHART_COLORS.accent : CHART_COLORS.danger
                };
            });
    }, [agentsData]);

    if (isLoading) {
        return (
            <div className="h-96 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <Card className="bg-zinc-900/50 border-white/5 shadow-2xl">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle className="text-[11px] font-black text-zinc-100 uppercase tracking-[0.2em]">
                        Payment Efficiency Radar
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={chartData}>
                            <defs>
                                <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={1}/>
                                    <stop offset="50%" stopColor={CHART_COLORS.warning} stopOpacity={1}/>
                                    <stop offset="100%" stopColor={CHART_COLORS.danger} stopOpacity={1}/>
                                </linearGradient>
                            </defs>
                            <RadialBar
                                dataKey="efficiency"
                                cornerRadius={4}
                                fill="url(#efficiencyGradient)"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={1}
                            />
                            <RechartsTooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-zinc-950/95 border border-white/10 rounded-lg p-3 shadow-2xl">
                                                <p className="text-white font-bold text-sm mb-2">{data.name}</p>
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                                                        <span className="text-zinc-200">Efficiency: </span>
                                                        <span className="text-white font-bold">{data.efficiency.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                                                        <span className="text-zinc-200">Paid: </span>
                                                        <span className="text-white font-bold">{formatCurrency(data.paid)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-3 h-3 rounded bg-amber-500"></div>
                                                        <span className="text-zinc-200">Pending: </span>
                                                        <span className="text-white font-bold">{formatCurrency(data.pending)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                                                        <span className="text-zinc-200">Total: </span>
                                                        <span className="text-white font-bold">{formatCurrency(data.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Legend 
                                iconSize={8}
                                wrapperStyle={{ 
                                    fontSize: '10px', 
                                    color: '#e4e4e7',
                                    paddingTop: '20px'
                                }}
                                formatter={(value, entry) => (
                                    <span style={{ color: entry.color }}>{value}</span>
                                )}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
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

const AgentDetailsDialog = ({ open, onClose, agentData }) => {
    const getMonthName = (monthNum) => format(new Date(2000, monthNum - 1, 1), "MMMM");

    if (!agentData) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="min-w-[70vw] h-[90vh] bg-zinc-950 border-white/10 overflow-hidden">
                <DialogHeader className="border-b border-white/5 pb-4">
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <BarChart3 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                                {agentData?.agent?.name}
                            </h3>
                            <p className="text-sm text-zinc-400 font-medium">
                                {agentData?.agent?.email} • Detailed Analytics
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                
                <div className="overflow-y-auto flex-1 p-1 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="space-y-6">
                        {/* Agent Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-zinc-900/50 border-white/5">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10">
                                            <DollarSign className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Total Commission</p>
                                            <p className="text-xl font-black text-white">{formatCurrency(agentData?.totalCommission)}</p>
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
                                            <p className="text-xl font-black text-emerald-400">{formatCurrency(agentData?.totalPaid)}</p>
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
                                            <p className="text-xl font-black text-amber-400">{formatCurrency(agentData?.totalPending)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {agentData?.reports?.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-6 bg-primary rounded-full"></div>
                                    <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-[0.2em]">Monthly Performance Analytics</span>
                                </div>

                                <MonthlyTrendsChart agentData={agentData} />

                                <div className="space-y-4">
                                    {agentData.reports.map((report) => (
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
                </div>
            </DialogContent>
        </Dialog>
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

const AgentRow = ({ agentData, onView, onPay, onShowDetails }) => {
    return (
        <TableRow className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <TableCell className="pl-6">
                <div className="flex flex-col">
                    <span className="font-black text-white text-sm tracking-tight uppercase italic">{agentData?.agent?.name}</span>
                    <span className="text-[11px] text-zinc-200 font-bold tracking-tight opacity-80">{agentData?.agent?.email}</span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <span className="font-black text-white">{formatCurrency(agentData?.totalCommission)}</span>
            </TableCell>
            <TableCell className="text-right">
                <span className="font-black text-emerald-400">{formatCurrency(agentData?.totalPaid)}</span>
            </TableCell>
            <TableCell className="text-right">
                <span className={cn("font-black", (agentData?.totalPending || 0) > 0 ? "text-amber-400" : "text-zinc-400")}>
                    {formatCurrency(agentData?.totalPending)}
                </span>
            </TableCell>
            <TableCell className="text-right pr-6">
                <div className="flex items-center justify-end gap-1.5">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onShowDetails?.(agentData)}
                                    className="h-8 w-8 text-zinc-400 hover:text-primary hover:bg-primary/10"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Analytics</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onView?.(agentData?.agent?._id, agentData?.agent?.name)}
                                    className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onPay?.(agentData)}
                                    className="h-8 w-8 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10"
                                >
                                    <Wallet className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Process Payout</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </TableCell>
        </TableRow>
    );
};

const AgentCommission = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [searchQuery, setSearchQuery] = useState("");
    const [viewDialog, setViewDialog] = useState({ open: false, id: null, name: "" });
    const [payDialog, setPayDialog] = useState({ open: false, agentData: null });
    const [detailsDialog, setDetailsDialog] = useState({ open: false, agentData: null });

    const handleOpenView = (id, name) => {
        setViewDialog({ open: true, id, name });
    };

    const handleCloseView = () => {
        setViewDialog({ open: false, id: null, name: "" });
    };

    const handleOpenPay = (agentData) => {
        setPayDialog({ open: true, agentData });
    };

    const handleClosePay = () => {
        setPayDialog({ open: false, agentData: null });
    };

    const handleOpenDetails = (agentData) => {
        setDetailsDialog({ open: true, agentData });
    };

    const handleCloseDetails = () => {
        setDetailsDialog({ open: false, agentData: null });
    };

    const { data: agentsData, isLoading, refetch } = useQuery({
        queryKey: ["agentCommissions", selectedYear],
        queryFn: () => fetchAgentCommissions({ year: selectedYear }),
    });

    const filteredAgents = useMemo(() => {
        if (!agentsData || !Array.isArray(agentsData)) return [];
        return agentsData.filter(item =>
            item?.agent?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item?.agent?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [agentsData, searchQuery]);

    const totals = useMemo(() => {
        if (!agentsData || !Array.isArray(agentsData)) return { commission: 0, paid: 0, pending: 0 };
        return agentsData.reduce((acc, curr) => ({
            commission: acc.commission + (curr.totalCommission || 0),
            paid: acc.paid + (curr.totalPaid || 0),
            pending: acc.pending + (curr.totalPending || 0),
        }), { commission: 0, paid: 0, pending: 0 });
    }, [agentsData]);

    const breadcrumbs = [{ title: "Admin", isNavigation: true }, { title: "Agent Commission", isNavigation: false }];

    return (
        <div className="flex flex-col min-h-screen bg-black text-zinc-100">
            <NavbarItem title="Agent Commission" breadcrumbs={breadcrumbs} />

            <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white uppercase italic">Agent Ledger</h2>
                        <p className="text-sm text-zinc-400 font-medium tracking-tight">Financial overview & payout tracking.</p>
                    </div>
                    <div className="flex items-center gap-3">
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

                {/* Global Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard title="totalCommission" value={formatCurrency(totals.commission)} icon={DollarSign} color="text-primary" bg="bg-primary/10" isLoading={isLoading} />
                    <SummaryCard title="totalPaid" value={formatCurrency(totals.paid)} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" isLoading={isLoading} />
                    <SummaryCard title="totalPending" value={formatCurrency(totals.pending)} icon={Clock} color="text-amber-400" bg="bg-amber-500/10" isLoading={isLoading} />
                </div>

                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CommissionDistributionChart agentsData={agentsData} isLoading={isLoading} />
                    <PaymentEfficiencyChart agentsData={agentsData} isLoading={isLoading} />
                </div>

                {/* Search & Utility */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900/30 border border-white/5">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-primary" />
                        <Input
                            placeholder="Filter by agent name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-black border-white/10 hover:border-white/20 focus:border-primary/50 text-sm h-11 rounded-lg text-white"
                        />
                    </div>
                    <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Records found: {filteredAgents.length}</span>
                </div>

                {/* Primary Agent Table */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader className="bg-zinc-950/90 border-b border-white/10">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="text-[11px] font-black uppercase text-zinc-200 h-14 tracking-widest pl-6">agent</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-zinc-200 h-14 tracking-widest text-right">totalCommission</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-zinc-200 h-14 tracking-widest text-right">totalPaid</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-zinc-200 h-14 tracking-widest text-right">totalPending</TableHead>
                                <TableHead className="text-[11px] font-black uppercase text-zinc-200 h-14 tracking-widest text-right pr-6">actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i} className="border-white/5">
                                        <TableCell colSpan={5} className="py-10 text-center text-white font-bold uppercase tracking-widest animate-pulse text-[10px] pl-6">Processing Neural Ledger...</TableCell>
                                    </TableRow>
                                ))
                            ) : filteredAgents.map((agent) => (
                                <AgentRow
                                    key={agent.agent._id}
                                    agentData={agent}
                                    onView={handleOpenView}
                                    onPay={handleOpenPay}
                                    onShowDetails={handleOpenDetails}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <ViewAgentDialog
                    open={viewDialog.open}
                    onClose={handleCloseView}
                    agentId={viewDialog.id}
                    agentName={viewDialog.name}
                />

                <PayAgentDialog
                    open={payDialog.open}
                    onClose={handleClosePay}
                    agentId={payDialog.agentData?.agent?._id}
                    agentName={payDialog.agentData?.agent?.name}
                    agentData={payDialog.agentData}
                />

                <AgentDetailsDialog
                    open={detailsDialog.open}
                    onClose={handleCloseDetails}
                    agentData={detailsDialog.agentData}
                />
            </div>
        </div>
    );
};

export default AgentCommission;
