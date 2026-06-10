import { ContainerComponent } from "@/components/ui/Container";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import InviteRunDetailComponent from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/invite/[runId]/InviteRunDetailComponent";

interface Props {
    params: Promise<{ id: string; runId: string }>;
}

export default async function InviteRunPage({ params }: Props) {
    const { id, runId } = await params;

    return (
        <ContainerComponent maxWidth={false} marging={false}>
            <Hydrate>
                <InviteRunDetailComponent accountId={id} runId={runId} />
            </Hydrate>
        </ContainerComponent>
    );
}
