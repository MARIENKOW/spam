// types/express.d.ts

import { Actor } from "@/modules/auth/auth.type";

declare global {
    namespace Express {
        interface Request {
            actor?: Actor;
        }
    }
}
