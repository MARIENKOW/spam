"use client";

import { SessionUserViewDto } from "@myorg/shared/dto";
import { SessionCard } from "@/components/common/session/SessionCard";
import { RevokeSessionAction } from "@/components/common/session/RevokeSessionAction";
import SessionServiceUser from "@/services/auth/user/session.service.user";
import { $apiUserClient } from "@/utils/api/user/fetch.user.client";

interface SessionCardProps {
    session: SessionUserViewDto;
}

const { revoke } = new SessionServiceUser($apiUserClient);

export const SessionCardUser = ({ session }: SessionCardProps) => {
    return (
        <SessionCard
            session={session}
            action={<RevokeSessionAction onRevoke={() => revoke(session.id)} />}
        />
    );
};
