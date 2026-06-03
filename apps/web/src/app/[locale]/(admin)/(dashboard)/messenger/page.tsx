import { $apiAdminServer } from "@/utils/api/admin/fetch.admin.server";
import MessengerService from "@/services/messenger/messenger.service";
import MessengerPage from "@/components/features/messenger/MessengerPage";
import { MessengerAccountDialogsDto } from "@myorg/shared/dto";

const messengerService = new MessengerService($apiAdminServer);

export default async function Page() {
    let accounts: MessengerAccountDialogsDto[] = [];
    try {
        const res = await messengerService.getDialogs();
        accounts = res.data;
    } catch {
        accounts = [];
    }

    return <MessengerPage initialAccounts={accounts} />;
}
