"use client";

import { AdminDto } from "@myorg/shared/dto";
import {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";

type AdminAuthContext = {
    admin: AdminDto | null;
    error: boolean;
    setAdmin: Dispatch<SetStateAction<AdminDto | null>>;
};

const AdminAuthContext = createContext<AdminAuthContext>({
    admin: null,
    error: false,
    setAdmin: () => {},
});

export default function AdminAuthProvider({
    children,
    admin: initialAdmin,
    error,
}: {
    error: boolean;
    admin: AdminDto | null;
    children: React.ReactNode;
}) {
    const [admin, setAdmin] = useState<AdminDto | null>(initialAdmin);

    useEffect(() => {
        setAdmin(initialAdmin);
    }, [initialAdmin]);
    return (
        <AdminAuthContext.Provider value={{ admin, setAdmin, error }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => {
    return useContext(AdminAuthContext);
};
