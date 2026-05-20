import { InvitationNote } from "../../fields";
import z from "zod";

export const UpdateNoteUserManagementSchema = z.object({
    note: InvitationNote,
});

export type UpdateNoteUserManagementDtoInput = z.input<typeof UpdateNoteUserManagementSchema>;
export type UpdateNoteUserManagementDtoOutput = z.infer<typeof UpdateNoteUserManagementSchema>;
