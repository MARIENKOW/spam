import { Email, InvitationNote } from "../../fields";
import z from "zod";

export const UpdateNoteAdminInvitationSchema = z.object({
    note: InvitationNote,
});

export type UpdateNoteAdminInvitationDtoInput = z.input<
    typeof UpdateNoteAdminInvitationSchema
>;
export type UpdateNoteAdminInvitationDtoOutput = z.infer<
    typeof UpdateNoteAdminInvitationSchema
>;

export const CreateAdminInvitationSchema =
    UpdateNoteAdminInvitationSchema.extend({
        email: Email,
        note: InvitationNote,
    });

export type CreateAdminInvitationDtoInput = z.input<
    typeof CreateAdminInvitationSchema
>;
export type CreateAdminInvitationDtoOutput = z.infer<
    typeof CreateAdminInvitationSchema
>;
