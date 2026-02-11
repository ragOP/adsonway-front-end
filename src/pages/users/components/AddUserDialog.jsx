import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createUser } from "../helpers/createUser";

const AddUserDialog = ({ open, onClose }) => {
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        username: "",
        password: "",
        role: "user",
        facebook_commission: "",
        google_commission: "",
        facebook_credit_commission: "",
        // google_credit_commission: "",
        facebook_application_fee: "",
        google_application_fee: "",
        facebook_credit_application_fee: "",
        // google_credit_application_fee: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            full_name: "",
            email: "",
            username: "",
            password: "",
            role: "user",
            facebook_commission: "",
            google_commission: "",
            facebook_credit_commission: "",
            google_credit_commission: "",
            facebook_application_fee: "",
            google_application_fee: "",
            facebook_credit_application_fee: "",
            google_credit_application_fee: "",
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const addUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (response) => {
            if (response?.response?.success) {
                toast.success("User added successfully!");
                queryClient.invalidateQueries(["users"]);
                handleClose();
            } else {
                toast.error(response?.response?.data?.message || response?.response?.message || response?.message || "Failed to add user.");
            }
        },
        onError: (error) => {
            console.error(error);
            toast.error(error?.response?.data?.message || error?.message || "Failed to add user.");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        addUserMutation.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new user account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <style>{`
                        /* Chrome, Safari, Edge, Opera */
                        input::-webkit-outer-spin-button,
                        input::-webkit-inner-spin-button {
                            -webkit-appearance: none;
                            margin: 0;
                        }

                        /* Firefox */
                        input[type=number] {
                            -moz-appearance: textfield;
                        }
                    `}</style>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                placeholder="Enter full name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? (
                                        <Eye className="w-4 h-4" />
                                    ) : (
                                        <EyeOff className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Facebook */}
                            <div className="grid gap-2">
                                <Label htmlFor="facebook_commission">Facebook Commission (%)</Label>
                                <Input
                                    id="facebook_commission"
                                    name="facebook_commission"
                                    type="number"
                                    value={formData.facebook_commission}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="facebook_application_fee">Facebook App Fee</Label>
                                <Input
                                    id="facebook_application_fee"
                                    name="facebook_application_fee"
                                    type="number"
                                    value={formData.facebook_application_fee}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="facebook_credit_commission">Facebook Credit Comm (%)</Label>
                                <Input
                                    id="facebook_credit_commission"
                                    name="facebook_credit_commission"
                                    type="number"
                                    value={formData.facebook_credit_commission}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="facebook_credit_application_fee">Facebook Credit App Fee</Label>
                                <Input
                                    id="facebook_credit_application_fee"
                                    name="facebook_credit_application_fee"
                                    type="number"
                                    value={formData.facebook_credit_application_fee}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Google */}
                            <div className="grid gap-2">
                                <Label htmlFor="google_commission">Google Commission (%)</Label>
                                <Input
                                    id="google_commission"
                                    name="google_commission"
                                    type="number"
                                    value={formData.google_commission}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="google_application_fee">Google App Fee</Label>
                                <Input
                                    id="google_application_fee"
                                    name="google_application_fee"
                                    type="number"
                                    value={formData.google_application_fee}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {/* <div className="grid gap-2">
                                <Label htmlFor="google_credit_commission">Google Credit Comm (%)</Label>
                                <Input
                                    id="google_credit_commission"
                                    name="google_credit_commission"
                                    type="number"
                                    value={formData.google_credit_commission}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="google_credit_application_fee">Google Credit App Fee</Label>
                                <Input
                                    id="google_credit_application_fee"
                                    name="google_credit_application_fee"
                                    type="number"
                                    value={formData.google_credit_application_fee}
                                    onChange={handleChange}
                                    required
                                />
                            </div> */}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={addUserMutation.isPending}>
                            {addUserMutation.isPending && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            )}
                            {addUserMutation.isPending ? "Adding..." : "Add User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddUserDialog;
