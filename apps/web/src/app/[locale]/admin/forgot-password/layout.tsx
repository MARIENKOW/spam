import AdminOnlyPublicWrapper from "@/components/wrappers/auth/AdminOnlyPublicWrapper";

export default function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminOnlyPublicWrapper>{children}</AdminOnlyPublicWrapper>;
}
