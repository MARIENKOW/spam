import BroadcastPageComponent from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/broadcast/BroadcastPageComponent";
import { ContainerComponent } from "@/components/ui/Container";
import { Hydrate } from "@/lib/tanstack/Hydrate";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function BroadcastPage({ params }: Props) {
    const { id } = await params;

    return (
        <ContainerComponent maxWidth={false} marging={false}>
            <Hydrate>
                <BroadcastPageComponent accountId={id} />
            </Hydrate>
        </ContainerComponent>
    );
}
