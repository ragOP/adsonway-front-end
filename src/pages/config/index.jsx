import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import NavbarItem from "@/components/navbar/navbar_item";
import { adjustPlatformFee } from "./helpers/adjustPlatformFee";
import { getConfig } from "./helpers/getConfig";
import { Loader2, Settings2, RefreshCw, Info } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const ConfigPage = () => {
    const queryClient = useQueryClient();
    const [platformFee, setPlatformFee] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const { data: configData, isLoading: isFetching, refetch } = useQuery({
        queryKey: ["platform-config"],
        queryFn: getConfig,
    });

    useEffect(() => {
        if (configData?.response?.data) {
            const data = configData.response.data;
            const config = Array.isArray(data) ? data[0] : data;
            if (config && config.platform_fee !== undefined) {
                setPlatformFee(config.platform_fee.toString());
            }
        }
    }, [configData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (platformFee === "" || isNaN(platformFee)) {
            toast.error("Please enter a valid platform fee");
            return;
        }

        setIsUpdating(true);
        try {
            const response = await adjustPlatformFee(Number(platformFee));
            if (response && (response.success || response.response?.success)) {
                toast.success("Platform fee updated successfully");
                queryClient.invalidateQueries(["platform-config"]);
            } else {
                toast.error(response?.message || response?.response?.message || "Failed to update platform fee");
            }
        } catch (error) {
            toast.error("An error occurred while updating platform fee");
        } finally {
            setIsUpdating(false);
        }
    };

    const breadcrumbs = [{ title: "Config", isNavigation: true }];

    const currentFee = configData?.response?.data?.platform_fee || configData?.response?.data?.[0]?.platform_fee || '0';

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <NavbarItem title="Config" breadcrumbs={breadcrumbs} />

            <div className="px-4 py-8">
                {/* Header Section consistency with other pages */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                            <Settings2 className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Platform Configuration</h2>
                            <p className="text-zinc-500 text-sm">Manage global system settings and fees</p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white transition-all h-9 px-4 rounded-lg"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                        Sync Data
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card className="bg-zinc-950/50 border border-zinc-900 backdrop-blur-sm shadow-2xl rounded-2xl w-full">
                        <CardHeader className="border-b border-zinc-900/50 pb-6 px-8 py-7">
                            <CardTitle className="text-lg font-semibold text-white">Fee Management</CardTitle>
                            <CardDescription className="text-zinc-500">
                                This fee is automatically deducted from all system transactions.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="p-8">
                            {isFetching && !configData ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                    <p className="text-zinc-500 text-sm font-medium">Fetching settings...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="platform_fee" className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                                Platform Service Fee
                                            </Label>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-full">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                <span className="text-[10px] font-bold text-green-500/90 tracking-wider">LIVE: {currentFee}%</span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Input
                                                id="platform_fee"
                                                type="number"
                                                placeholder="0.00"
                                                value={platformFee}
                                                onChange={(e) => setPlatformFee(e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="pr-12 h-10 bg-zinc-900/30 border-zinc-800 text-white focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500/50 text-base font-medium transition-all rounded-xl"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 font-bold text-base select-none">
                                                %
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 pl-1">
                                            Note: Changes will take effect immediately for all new transactions.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isUpdating || isFetching}
                                        className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all rounded-xl shadow-[0_10px_30px_rgba(79,70,229,0.2)] active:scale-[0.98]"
                                    >
                                        {isUpdating ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Saving Changes...</span>
                                            </div>
                                        ) : "Update Settings"}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};



export default ConfigPage;
