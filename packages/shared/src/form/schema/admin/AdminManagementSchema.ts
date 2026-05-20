import { InvitationNote } from "../../fields";
import z from "zod";

export const UpdateNoteAdminManagementSchema = z.object({
    note: InvitationNote,
});

export type UpdateNoteAdminManagementDtoInput = z.input<
    typeof UpdateNoteAdminManagementSchema
>;
export type UpdateNoteAdminManagementDtoOutput = z.infer<
    typeof UpdateNoteAdminManagementSchema
>;
