"use client";

import { UserDto } from "@myorg/shared/dto";
import {
    createContext,
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";

type UserAuthContext = {
    user: UserDto | null;
    error: boolean;
    setUser: Dispatch<SetStateAction<UserDto | null>>;
};

const UserAuthContext = createContext<UserAuthContext>({
    user: null,
    error: false,
    setUser: () => {},
});

export default function UserAuthProvider({
    children,
    user: initialUser,
    error,
}: {
    error: boolean;
    user: UserDto | null;
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<UserDto | null>(initialUser);

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser]);
    return (
        <UserAuthContext.Provider value={{ user, error, setUser }}>
            {children}
        </UserAuthContext.Provider>
    );
}

export const useUserAuth = () => useContext(UserAuthContext);
