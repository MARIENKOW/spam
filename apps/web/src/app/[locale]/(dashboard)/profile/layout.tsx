import UserPrivateWrapper from "@/components/wrappers/auth/UserPrivateWrapper";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <UserPrivateWrapper>{children}</UserPrivateWrapper>;
}
