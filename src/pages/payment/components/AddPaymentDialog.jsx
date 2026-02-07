import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPayment } from "../helpers/createPayment";
import { updatePayment } from "../helpers/updatePayment";
import { fetchSinglePayment } from "../helpers/fetchSinglePayment";
import { Loader2, Upload, X } from "lucide-react";
import { uploadFile } from "@/helpers/uploadFile";

const AddPaymentDialog = ({ open, setOpen, editId = null }) => {
    const queryClient = useQueryClient();
    const isEditMode = !!editId;

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true,
        qr_image: "",
    });
    const [isUploading, setIsUploading] = useState(false);

    const { data: paymentData, isLoading: isFetching } = useQuery({
        queryKey: ["payment", editId],
        queryFn: () => fetchSinglePayment(editId),
        enabled: isEditMode && open,
    });
    useEffect(() => {
        if (paymentData && isEditMode) {
            setFormData({
                name: paymentData.name || "",
                description: paymentData.description || "",
                is_active: paymentData.is_active ?? true,
                qr_code: paymentData.qr_image || paymentData.qr_code || "",
            });
        }
    }, [paymentData, isEditMode]);
    useEffect(() => {
        if (!open) {
            setFormData({
                name: "",
                description: "",
                is_active: true,
                qr_code: "",
            });
        }
    }, [open]);

    const { mutate: createMutation, isPending: isCreating } = useMutation({
        mutationFn: createPayment,
        onSuccess: () => {
            toast.success("Payment method created successfully");
            queryClient.invalidateQueries(["payments"]);
            setOpen(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create payment method");
        },
    });

    const { mutate: updateMutation, isPending: isUpdating } = useMutation({
        mutationFn: updatePayment,
        onSuccess: () => {
            toast.success("Payment method updated successfully");
            queryClient.invalidateQueries(["payments"]);
            setOpen(false);
        },
        onError: (error) => {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update payment method");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Please enter a payment method name");
            return;
        }

        const submissionData = {
            ...formData,
            qr_image: formData.qr_code || "https://placehold.co/600x400?text=No+Screenshot",
        };

        if (isEditMode) {
            updateMutation({ id: editId, data: submissionData });
        } else {
            createMutation(submissionData);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        if (name === "is_active") {
            setFormData({ ...formData, [name]: value === "true" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await uploadFile(file);
            if (res.response?.success) {
                setFormData(prev => ({ ...prev, qr_code: res.response.data.url }));
                toast.success("QR Code uploaded successfully");
            } else {
                toast.error(res.response?.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const isPending = isCreating || isUpdating;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
                </DialogHeader>
                {isFetching ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., UPI, Credit Card, PayPal"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g., Google Pay, PhonePe, Paytm"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="qr_code">QR Code (Optional)</Label>
                            {formData.qr_code ? (
                                <div className="relative mt-2 border rounded-md p-2 flex items-center justify-between bg-card/50">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <img
                                            src={formData.qr_code}
                                            alt="QR Code"
                                            className="h-12 w-12 object-cover rounded border"
                                        />
                                        <span className="text-xs truncate text-gray-400">QR Code Uploaded</span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setFormData(prev => ({ ...prev, qr_code: "" }))}
                                        className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                                        {isUploading ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-gray-400" />
                                        )}
                                        <p className="text-xs text-center text-gray-500">
                                            {isUploading ? "Uploading..." : "Click to upload QR Code image"}
                                        </p>
                                        <Input
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer h-full"
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="is_active">Status</Label>
                            <SelectDropdown
                                options={[
                                    { label: "Active", value: "true" },
                                    { label: "Inactive", value: "false" },
                                ]}
                                value={formData.is_active ? "true" : "false"}
                                onValueChange={(value) => handleSelectChange("is_active", value)}
                                placeholder="Select status"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? "Update Payment Method" : "Create Payment Method"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default AddPaymentDialog;
