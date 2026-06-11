import { ContainerComponent } from "@/components/ui/Container";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import BroadcastRunDetailComponent from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/[runId]/BroadcastRunDetailComponent";

interface Props {
    params: Promise<{ id: string; runId: string }>;
}

export default async function BroadcastRunPage({ params }: Props) {
    const { id, runId } = await params;

    return (
        <ContainerComponent maxWidth={false} marging={false}>
            <Hydrate>
                <BroadcastRunDetailComponent accountId={id} runId={runId} />
            </Hydrate>
        </ContainerComponent>
    );
}
