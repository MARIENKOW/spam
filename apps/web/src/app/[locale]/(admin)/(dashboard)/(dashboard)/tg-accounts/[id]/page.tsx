import { ContainerComponent } from "@/components/ui/Container";
import { Hydrate } from "@/lib/tanstack/Hydrate";
import TgAccountDetailComponent from "@/app/[locale]/(admin)/(dashboard)/(dashboard)/tg-accounts/[id]/TgAccountDetailComponent";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function TgAccountDetailPage({ params }: Props) {
    const { id } = await params;

    return (
        <ContainerComponent maxWidth={false} marging={false}>
            <Hydrate>
                <TgAccountDetailComponent accountId={id} />
            </Hydrate>
        </ContainerComponent>
    );
}
