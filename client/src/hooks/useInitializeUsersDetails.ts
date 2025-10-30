import { useAtom } from "jotai";
import { UsersDetailsAtom } from "../atoms/admin/UsersDetailsAtom";
import { useEffect } from "react";
import { http } from "../lib/apiV2";
import { toast } from "sonner";

export function useInitializeUsersDetails({page = 1}) {

    const [, setUsersDetails] = useAtom(UsersDetailsAtom);
    //const [, setTotalPages] = useAtom(PaginationAtom);

    //const adminId: string = getUserInfoFromToken().userId;
    const pageSize = 8;

    useEffect(() => {
        http.userManagement.getAllUsers()
            .then((response) => {
                setUsersDetails(response.items!);
                //setTotalPages(Math.ceil(response.totalItems / pageSize));
            }).catch(e => {
            const message = e.response?.data?.message || "An unexpected error occurred.";
            toast.error(`Error: ${message}`);
        });
    }, [page, pageSize]);
}