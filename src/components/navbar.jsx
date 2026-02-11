import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Search, Bell, Flag, Wallet, CreditCard, Landmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery } from "@tanstack/react-query"
import { getItem } from "@/utils/local_storage"
import { fetchMyWallet } from "./navbar/helpers/fetchMyWallet"
import ProfileUpdateSheet from "@/components/profile/ProfileUpdateSheet"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCardContext } from "@/context/CardContext"

export function Navbar() {
    const userRole = getItem("userRole");
    const userFullName = getItem("userFullName");
    const userName = getItem("userName");
    const userAvatar = getItem("userDisplayPicture");
    const [openProfile, setOpenProfile] = useState(false);
    const { isCard, setIsCard } = useCardContext();

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const displayName = userFullName || userName || "User";
    const initials = getInitials(displayName);

    const { data: walletData } = useQuery({
        queryKey: ["user-wallet"],
        queryFn: fetchMyWallet,
        enabled: userRole === "user",
    });

    const walletBalance = walletData?.wallet || { amount: 0, currency: "INR" };

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 sticky top-0 bg-[#06080A]/80 backdrop-blur-md z-50 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
            </div>


            <div className="flex-1 flex min-w-0">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search"
                        className="pl-9 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-lg h-9"
                    />
                </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    {/* <Flag className="h-5 w-5 text-muted-foreground" /> */}
                </button>
                {/* <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button> */}

                {userRole === "user" && (
                    <div className={`flex items-center gap-3 p-1.5 pl-4 pr-1.5 rounded-full border backdrop-blur-md transition-all duration-500 ${isCard
                            ? "bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 hover:bg-emerald-500/15"
                            : "bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_-3px_rgba(59,130,246,0.15)] hover:border-blue-500/30 hover:bg-blue-500/15"
                        }`}>
                        <div className={`flex items-center gap-2 text-xs font-bold tracking-wide uppercase transition-colors duration-300 ${isCard ? "text-emerald-400" : "text-blue-400"
                            }`}>
                            {isCard ? <Landmark className="w-4 h-4" strokeWidth={2.5} /> : <CreditCard className="w-4 h-4" strokeWidth={2.5} />}
                            <span className="hidden sm:inline-block pt-0.5">
                                {isCard ? "Credit Line" : "Card Line"}
                            </span>
                        </div>
                        <Switch
                            checked={isCard}
                            onCheckedChange={setIsCard}
                            className={`h-6 w-10 border-2 border-transparent transition-all duration-500 ${isCard
                                    ? "data-[state=checked]:bg-emerald-500 data-[state=checked]:shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                    : "data-[state=unchecked]:bg-blue-500 data-[state=unchecked]:shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                                }`}
                        />
                    </div>
                )}

                {userRole === "user" && (
                    <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                        <Wallet className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-semibold text-white">
                            {walletBalance.currency} {walletBalance.amount?.toLocaleString() || "0"}
                        </span>
                    </div>
                )}
                {userRole === "agent" && (
                    <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
                        <span className="text-sm font-semibold text-white">
                            Commission Fee : {getItem("userCommisionPercent") || 0}%
                        </span>
                    </div>
                )}

                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setOpenProfile(true)}>
                    <AvatarImage src={userAvatar} alt={displayName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>

                <ProfileUpdateSheet open={openProfile} onClose={() => setOpenProfile(false)} />
            </div>
        </header>
    )
}
