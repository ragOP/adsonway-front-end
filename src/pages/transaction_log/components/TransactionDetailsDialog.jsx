import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Eye, User, Wallet, Calendar, FileText, ArrowRightLeft } from "lucide-react";

const TransactionDetailsDialog = ({ open, onOpenChange, data }) => {
    if (!data) return null;

    const isCredit = data?.type === 'credit';
    const amountColor = isCredit ? 'text-emerald-500' : 'text-rose-500';
    const amountBg = isCredit ? 'bg-emerald-500/10' : 'bg-rose-500/10';
    const amountBorder = isCredit ? 'border-emerald-500/20' : 'border-rose-500/20';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-zinc-950 border-zinc-800 p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            Transaction Details
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${isCredit ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'} uppercase tracking-wider font-semibold`}>
                            {data?.type}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Amount & Balance Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`col-span-2 sm:col-span-1 rounded-xl border ${amountBorder} ${amountBg} p-4 flex flex-col justify-center`}>
                            <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-1">Amount</span>
                            <span className={`text-3xl font-bold ${amountColor}`}>
                                {isCredit ? '+' : '-'}${data?.amount?.toLocaleString()}
                            </span>
                        </div>

                        <div className="col-span-2 sm:col-span-1 bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-500 text-xs">Previous Balance</span>
                                <span className="text-zinc-300 font-mono">${data?.balanceBefore?.toLocaleString()}</span>
                            </div>
                            <div className="h-px bg-zinc-800/50 w-full" />
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-400 text-xs font-medium">New Balance</span>
                                <span className="text-white font-mono font-bold">${data?.balanceAfter?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="bg-zinc-900/30 rounded-lg border border-zinc-800 p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                            <User className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{data?.userId?.full_name}</p>
                            <p className="text-xs text-zinc-500 truncate">{data?.userId?.email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-zinc-500">Username</p>
                            <p className="text-sm text-zinc-300">@{data?.userId?.username}</p>
                        </div>
                    </div>

                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                <Calendar className="h-3 w-3" /> Date & Time
                            </div>
                            <p className="text-zinc-300 text-sm font-medium">
                                {data?.createdAt ? format(new Date(data?.createdAt), "MMM d, yyyy") : "N/A"}
                            </p>
                            <p className="text-zinc-500 text-xs">
                                {data?.createdAt ? format(new Date(data?.createdAt), "h:mm a") : ""}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-zinc-500 text-xs">
                                <ArrowRightLeft className="h-3 w-3" /> Status
                            </div>
                            <p className={`text-sm font-medium capitalize ${data?.status === 'completed' ? 'text-teal-400' :
                                data?.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                                }`}>
                                {data?.status || 'Pending'}
                            </p>
                        </div>
                    </div>

                    {/* Description & ID */}
                    <div className="space-y-3 pt-2">
                        {data?.description && (
                            <div className="space-y-1.5">
                                <span className="text-zinc-500 text-xs font-medium">Description</span>
                                <div className="bg-zinc-900 rounded-md border border-zinc-800 p-3">
                                    <p className="text-zinc-300 text-sm leading-relaxed text-pretty">
                                        {data.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                            <span className="text-zinc-600 text-xs">Transaction ID</span>
                            <span className="font-mono text-xs text-zinc-500 select-all hover:text-zinc-400 transition-colors cursor-copy">
                                {data?._id}
                            </span>
                        </div> */}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TransactionDetailsDialog;
