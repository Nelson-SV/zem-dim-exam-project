import { useAtom } from "jotai";
import { UsersDetailsAtom } from "../atoms/admin/UsersDetailsAtom";
import { useEffect, useState } from "react";
import { http } from "../lib/api";
import { toast } from "sonner";

export function useInitializeUsersDetails({ page = 1, pageSize = 9, search = "", filter = false, reloadFlag = 0 }) {

    const [, setUsersDetails] = useAtom(UsersDetailsAtom);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        http.userManagement.getAllUsers(page, pageSize, search, filter)
            .then((response) => {
                setUsersDetails(response.items || []);
                setTotalItems(response.totalItems!);
                setTotalPages(Math.ceil(response.totalItems! / pageSize));

                if ((response.items?.length ?? 0) === 0 && search) {
                    toast.info("No users found for this search.");
                }
            }).catch((e) => {
                const message = e.response?.data?.message || "An unexpected error occurred.";
                toast.error(`Error: ${message}`);
            });
    }, [page, pageSize, search, filter, setUsersDetails, reloadFlag]);
    return { totalItems, totalPages };
}