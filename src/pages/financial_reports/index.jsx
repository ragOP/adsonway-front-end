import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import NavbarItem from "@/components/navbar/navbar_item";
import { getItem } from "@/utils/local_storage";
import { fetchFinancialReports } from "./helpers/fetchFinancialReports";
import { exportFinancialReports } from "./helpers/exportFinancialReports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, DollarSign, FileText, RefreshCw, CreditCard, CheckCircle2, Calendar as CalendarIcon, Filter, ArrowUpRight, TrendingUp, Layers, Activity, Download } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Helper to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0);
};

const FinancialReports = () => {
    // State for Date Objects
    const [startDate, setStartDate] = useState(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState(endOfMonth(new Date()));

    const [filters, setFilters] = useState({
        platform: "all",
        status: "all",
    });

    const userRole = getItem("userRole");
    const isUserColumnVisible = userRole === "admin" || userRole === "agent";

    const [activeTab, setActiveTab] = useState("deposits");

    // Derived string dates for API
    const fromDateStr = startDate ? format(startDate, "yyyy-MM-dd") : undefined;
    const toDateStr = endDate ? format(endDate, "yyyy-MM-dd") : undefined;

    const { data: reportsData, isLoading } = useQuery({
        queryKey: ["financialReports", filters, fromDateStr, toDateStr],
        queryFn: () => fetchFinancialReports({
            platform: filters.platform,
            status: filters.status,
            fromDate: fromDateStr,
            toDate: toDateStr,
        }),
        enabled: !!startDate && !!endDate,
    });

    // Extract Data
    const summary = reportsData?.summary || {};
    const depositRecords = reportsData?.depositRecords || [];
    const applicationsReport = reportsData?.applicationsReport || [];
    const refundsReport = reportsData?.refundsReport?.refunds || [];

    const handleExport = async () => {
        try {
            const toastId = toast.loading("Preparing download...");
            const response = await exportFinancialReports({
                platform: filters.platform,
                status: filters.status,
                fromDate: fromDateStr,
                toDate: toDateStr,
            });

            // Create blob link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `financial_report_${fromDateStr}_${toDateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.dismiss(toastId);
            toast.success("Report downloaded successfully");
        } catch (error) {
            console.error(error);
            toast.dismiss();
            toast.error("Failed to export report");
        }
    };

    const breadcrumbs = [{ title: "Financial Reports", isNavigation: true }];

    const renderStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === 'approved') return <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Approved</div>;
        if (s === 'rejected') return <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">Rejected</div>;
        if (s === 'pending') return <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</div>;
        return <Badge variant="outline" className="capitalize text-zinc-400">{status}</Badge>;
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
            <NavbarItem title="Financial Reports" breadcrumbs={breadcrumbs} />

            <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Overview</h2>
                        <p className="text-sm text-zinc-400">Manage and view your financial reports.</p>
                    </div>
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="bg-zinc-900 border-zinc-700 text-zinc-100 hover:bg-zinc-800 hover:text-white"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Filters Bar: 4 Equal Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl shadow-black/40">

                    {/* Platform Select */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Platform</Label>
                        <Select value={filters.platform} onValueChange={(val) => setFilters(prev => ({ ...prev, platform: val }))}>
                            <SelectTrigger className="bg-zinc-950/50 border-white/10 h-11 w-full text-sm hover:border-indigo-500/50 transition-colors focus:ring-0">
                                <SelectValue placeholder="All Platforms" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectItem value="all">All Platforms</SelectItem>
                                <SelectItem value="google">Google</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Select */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">Status</Label>
                        <Select value={filters.status} onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}>
                            <SelectTrigger className="bg-zinc-950/50 border-white/10 h-11 w-full text-sm hover:border-indigo-500/50 transition-colors focus:ring-0">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-950 border-zinc-800">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* From Date Picker - using Shadcn Calendar */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">From Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full h-11 justify-start text-left font-normal bg-zinc-950/50 border-white/10 hover:bg-zinc-900 hover:text-zinc-100 hover:border-indigo-500/50 p-3",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-black border-zinc-800" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                    className="bg-zinc-950 border border-zinc-800"
                                    classNames={{
                                        today: "bg-transparent text-zinc-300 font-normal hover:bg-zinc-800 hover:text-white"
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* To Date Picker - using Shadcn Calendar */}
                    <div className="space-y-1.5">
                        <Label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">To Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full h-11 justify-start text-left font-normal bg-zinc-950/50 border-white/10 hover:bg-zinc-900 hover:text-zinc-100 hover:border-indigo-500/50 p-3",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-black border-zinc-800" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                    className="bg-zinc-950 border border-zinc-800"
                                    classNames={{
                                        today: "bg-transparent text-zinc-300 font-normal hover:bg-zinc-800 hover:text-white"
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Approved Apps */}
                    <SummaryCard
                        title="Approved Applications"
                        value={summary.approvedApplicationsCount || 0}
                        icon={CheckCircle2}
                        color="text-emerald-400"
                        bg="bg-emerald-500/10"
                        isLoading={isLoading}
                    />

                    {/* Wallet Topups */}
                    <SummaryCard
                        title="Total Wallet Topups"
                        value={formatCurrency(summary.walletTopupsTotal)}
                        icon={CreditCard}
                        color="text-violet-400"
                        bg="bg-violet-500/10"
                        isLoading={isLoading}
                    />

                    {/* Total Deposits */}
                    <SummaryCard
                        title="Total Deposits"
                        value={formatCurrency(summary.totalDeposits)}
                        icon={TrendingUp}
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                        isLoading={isLoading}
                    />

                    {/* Total Refunds */}
                    <SummaryCard
                        title="Total Refunds"
                        value={formatCurrency(summary.totalRefunds)}
                        icon={RefreshCw}
                        color="text-orange-400"
                        bg="bg-orange-500/10"
                        isLoading={isLoading}
                    />
                </div>

                {/* Tabs & Table Section */}
                <div className="space-y-6">
                    {/* Tabs Navigation */}
                    <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-white/5 w-full md:w-fit backdrop-blur-sm overflow-x-auto">
                        <TabButton
                            active={activeTab === 'deposits'}
                            onClick={() => setActiveTab('deposits')}
                            label={`Deposit Records (${depositRecords.length})`}
                        />
                        <TabButton
                            active={activeTab === 'applications'}
                            onClick={() => setActiveTab('applications')}
                            label={`Applications Report (${applicationsReport.length})`}
                        />
                        <TabButton
                            active={activeTab === 'refunds'}
                            onClick={() => setActiveTab('refunds')}
                            label={`Refunds Report (${refundsReport.length})`}
                        />
                    </div>

                    {/* Data Table */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md min-h-[500px] flex flex-col">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-500 py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                                <span className="text-sm font-medium animate-pulse">Fetching Report Data...</span>
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <Table className="w-full">
                                    <TableHeader className="bg-zinc-950/80 border-b border-white/5">
                                        <TableRow className="border-none hover:bg-transparent">
                                            {activeTab === 'deposits' && (
                                                <>
                                                    <HeadCell>Date & Time</HeadCell>
                                                    {isUserColumnVisible && <HeadCell>User</HeadCell>}
                                                    <HeadCell>Account Details</HeadCell>
                                                    <HeadCell>Platform</HeadCell>
                                                    <HeadCell align="right">Amount</HeadCell>
                                                    <HeadCell align="right">Fees</HeadCell>
                                                    <HeadCell align="right">Total</HeadCell>
                                                    <HeadCell align="center">Status</HeadCell>
                                                </>
                                            )}
                                            {activeTab === 'applications' && (
                                                <>
                                                    <HeadCell>Date & Time</HeadCell>
                                                    <HeadCell>User</HeadCell>
                                                    <HeadCell>Account</HeadCell>
                                                    <HeadCell>Service</HeadCell>
                                                    <HeadCell align="right">App Fee</HeadCell>
                                                    <HeadCell align="right">Deposit</HeadCell>
                                                    <HeadCell align="right">Total Cost</HeadCell>
                                                    <HeadCell align="center">Status</HeadCell>
                                                </>
                                            )}
                                            {activeTab === 'refunds' && (
                                                <>
                                                    <HeadCell>Date & Time</HeadCell>
                                                    <HeadCell>User</HeadCell>
                                                    <HeadCell>Account</HeadCell>
                                                    <HeadCell>Platform</HeadCell>
                                                    <HeadCell align="right">Requested</HeadCell>
                                                    <HeadCell align="right">Fee Reversal</HeadCell>
                                                    <HeadCell align="right">Refunded</HeadCell>
                                                    <HeadCell align="center">Status</HeadCell>
                                                </>
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {/* DEPOSITS TABLE */}
                                        {activeTab === 'deposits' && depositRecords.map((item, i) => (
                                            <TableRow key={item.depositId || i} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <TableCell className="py-4 font-mono text-xs text-zinc-400">
                                                    <div>{format(new Date(item.date), "dd MMM yyyy")}</div>
                                                    <div className="text-zinc-600">{format(new Date(item.date), "hh:mm a")}</div>
                                                </TableCell>
                                                {isUserColumnVisible && (
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-zinc-200">{item.user?.fullName || item.user?.username || "N/A"}</span>
                                                            <span className="text-xs text-zinc-500">{item.user?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <div className="font-medium text-zinc-200">{item.adAccountName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.platform === 'google' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                                        <span className="capitalize text-zinc-300">{item.platform}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-zinc-300">{formatCurrency(item.amount)}</TableCell>
                                                <TableCell className="text-right text-xs text-amber-500/80">+{formatCurrency(item.fees)}</TableCell>
                                                <TableCell className="text-right font-bold text-white text-base">{formatCurrency(item.total)}</TableCell>
                                                <TableCell className="text-center">{renderStatusBadge(item.status)}</TableCell>
                                            </TableRow>
                                        ))}

                                        {/* APPLICATIONS TABLE */}
                                        {activeTab === 'applications' && applicationsReport.map((item, i) => (
                                            <TableRow key={i} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <TableCell className="py-4 font-mono text-xs text-zinc-400">
                                                    <div>{format(new Date(item.date), "dd MMM yyyy")}</div>
                                                    <div className="text-zinc-600">{format(new Date(item.date), "hh:mm a")}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-zinc-200">{item.user?.fullName || item.user?.username || "N/A"}</span>
                                                        <span className="text-xs text-zinc-500">{item.user?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-zinc-200">{item.accountName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.service?.toLowerCase() === 'google' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                                        <span className="capitalize text-zinc-300">{item.service}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-zinc-300">{formatCurrency(item.appFee)}</TableCell>
                                                <TableCell className="text-right text-zinc-300">
                                                    {formatCurrency(item.deposit)}
                                                    <span className="text-xs text-zinc-600 ml-1 block">(Fee: {formatCurrency(item.depositFee)})</span>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-white text-base">{formatCurrency(item.total)}</TableCell>
                                                <TableCell className="text-center">{renderStatusBadge(item.status)}</TableCell>
                                            </TableRow>
                                        ))}

                                        {/* REFUNDS TABLE */}
                                        {activeTab === 'refunds' && refundsReport.map((item, i) => (
                                            <TableRow key={item.refundId || i} className="group border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                                <TableCell className="py-4 font-mono text-xs text-zinc-400">
                                                    <div>{format(new Date(item.date), "dd MMM yyyy")}</div>
                                                    <div className="text-zinc-600">{format(new Date(item.date), "hh:mm a")}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-zinc-200">{item.user?.fullName || item.user?.username || "N/A"}</span>
                                                        <span className="text-xs text-zinc-500">{item.user?.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-zinc-200">{item.accountName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.platform === 'google' ? 'bg-orange-500' : 'bg-blue-500'}`}></span>
                                                        <span className="capitalize text-zinc-300">{item.platform}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-zinc-300">{formatCurrency(item.requestedAmount)}</TableCell>
                                                <TableCell className="text-right text-xs text-amber-500/80">+{formatCurrency(item.feesAmount)}</TableCell>
                                                <TableCell className="text-right font-bold text-emerald-400 text-base">{formatCurrency(item.totalRefundAmount)}</TableCell>
                                                <TableCell className="text-center">{renderStatusBadge(item.status)}</TableCell>
                                            </TableRow>
                                        ))}

                                        {/* Empty States */}
                                        {activeTab === 'deposits' && depositRecords.length === 0 && <EmptyRow colSpan={isUserColumnVisible ? 8 : 7} />}
                                        {activeTab === 'applications' && applicationsReport.length === 0 && <EmptyRow colSpan={isUserColumnVisible ? 8 : 7} />}
                                        {activeTab === 'refunds' && refundsReport.length === 0 && <EmptyRow colSpan={isUserColumnVisible ? 8 : 7} />}

                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// UI Components to declutter main component
const SummaryCard = ({ title, value, icon: Icon, color, bg, isLoading }) => (
    <Card className="group relative overflow-hidden bg-zinc-900/40 border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${bg} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 z-10 relative">
            <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${bg} ${color}`}>
                <Icon className="h-4 w-4" />
            </div>
        </CardHeader>
        <CardContent className="z-10 relative">
            <div className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                {isLoading ? <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded"></div> : value}
            </div>

        </CardContent>
    </Card>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 whitespace-nowrap ${active
            ? 'bg-zinc-800 text-white shadow-lg shadow-black/20'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            }`}
    >
        {label}
    </button>
);

const HeadCell = ({ children, align = "left" }) => (
    <TableHead className={`text-${align} text-[11px] uppercase tracking-wider font-bold text-zinc-500 h-10`}>
        {children}
    </TableHead>
);

const EmptyRow = ({ colSpan }) => (
    <TableRow className="hover:bg-transparent">
        <TableCell colSpan={colSpan} className="text-center py-24">
            <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-zinc-700" />
                </div>
                <p className="text-zinc-500 font-medium">No records found for the selected period.</p>
                <p className="text-xs text-zinc-600">Try adjusting your filters or date range.</p>
            </div>
        </TableCell>
    </TableRow>
);

export default FinancialReports;
