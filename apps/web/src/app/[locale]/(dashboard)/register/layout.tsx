import UserOnlyPublicWrapper from "@/components/wrappers/auth/UserOnlyPublicWrapper";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <UserOnlyPublicWrapper>{children}</UserOnlyPublicWrapper>;
}
