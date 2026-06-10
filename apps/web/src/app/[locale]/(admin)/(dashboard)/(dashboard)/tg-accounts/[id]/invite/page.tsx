import { ContainerComponent } from "@/components/ui/Container";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import InvitePageComponent from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/invite/InvitePageComponent";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function InvitePage({ params }: Props) {
    const { id } = await params;

    return (
        <ContainerComponent maxWidth={false} marging={false}>
            <Hydrate>
                <InvitePageComponent accountId={id} />
            </Hydrate>
        </ContainerComponent>
    );
}
