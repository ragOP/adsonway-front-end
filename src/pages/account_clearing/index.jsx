import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import NavbarItem from "@/components/navbar/navbar_item";
import RefundsTable from "./components/RefundsTable";
import AddRefundRequestDialog from "./components/AddRefundRequestDialog";

const AccountClearing = () => {
    const [totalRefunds, setTotalRefunds] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [params, setParams] = useState({
        page: 1,
        per_page: 25,
        search: "",
        start_date: undefined,
        end_date: undefined,
    });

    const debouncedSearch = useDebounce(searchText, 500);

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const onRowsPerPageChange = (newRowsPerPage) => {
        setParams((prev) => ({
            ...prev,
            page: 1,
            per_page: newRowsPerPage,
        }));
    };

    const onPageChange = (page) => {
        setParams((prev) => ({
            ...prev,
            page: page + 1,
        }));
    };

    const handleDateRangeChange = useCallback((range) => {
        if (range?.from && range?.to) {
            setParams((prev) => ({
                ...prev,
                startDate: format(range.from, "yyyy-MM-dd"),
                endDate: format(range.to, "yyyy-MM-dd"),
                page: 1,
            }));
        } else {
            setParams((prev) => ({
                ...prev,
                startDate: undefined,
                endDate: undefined,
                page: 1,
            }));
        }
    }, []);

    const breadcrumbs = [{ title: "Account Clearing", isNavigation: true }];

    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            search: debouncedSearch,
            page: 1,
        }));
    }, [debouncedSearch]);

    return (
        <div className="flex flex-col">
            <NavbarItem
                title="Account Clearing"
                breadcrumbs={breadcrumbs}
            />

            <div className="px-4">
                <CustomActionMenu
                    title="Refund Applications"
                    total={totalRefunds}
                    searchText={searchText}
                    handleSearch={handleSearch}
                    onRowsPerPageChange={onRowsPerPageChange}
                    showRowSelection={true}
                    rowsPerPage={params.per_page}
                    disableBulkExport={true}
                    disableAdd={false}
                    onAdd={() => setIsAddDialogOpen(true)}
                    showDateRangePicker={true}
                    handleDateRangeChange={handleDateRangeChange}
                />

                <RefundsTable
                    setTotalRefunds={setTotalRefunds}
                    params={params}
                    onPageChange={onPageChange}
                />

                <AddRefundRequestDialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                />
            </div>
        </div>
    );
};

export default AccountClearing;
