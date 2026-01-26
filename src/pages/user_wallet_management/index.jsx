import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import CustomActionMenu from "@/components/custom_action";
import NavbarItem from "@/components/navbar/navbar_item";
import UserWalletTable from "./components/UserWalletTable";

const UserWalletManagement = () => {
    const [usersLength, setUsersLength] = useState(0);
    const [searchText, setSearchText] = useState("");
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
            per_page: newRowsPerPage,
        }));
    };

    const pageTitle = "User Wallet Management";
    const breadcrumbs = [{ title: pageTitle, isNavigation: true }];

    useEffect(() => {
        setParams((prev) => ({
            ...prev,
            search: debouncedSearch,
        }));
    }, [debouncedSearch]);

    return (
        <div className="flex flex-col">
            <NavbarItem
                title={pageTitle}
                breadcrumbs={breadcrumbs}
            />

            <div className="px-4">
                <CustomActionMenu
                    title="User"
                    total={usersLength}
                    searchText={searchText}
                    handleSearch={handleSearch}
                    onRowsPerPageChange={onRowsPerPageChange}
                    showRowSelection={true}
                    rowsPerPage={params.per_page}
                    disableBulkExport={true}
                    disableAdd={true}
                />

                <UserWalletTable setUsersLength={setUsersLength} params={params} />
            </div>
        </div>
    );
};

export default UserWalletManagement;
