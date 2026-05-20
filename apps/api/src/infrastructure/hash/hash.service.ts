import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

@Injectable()
export class HashService {
    sha256(data: string): string {
        return crypto.createHash("sha256").update(data).digest("hex");
    }


    async hash(data: string, saltRounds: number = 12): Promise<string> {
        return bcrypt.hash(this.sha256(data), saltRounds);
    }

    async compare(data: string, hash: string): Promise<boolean> {
        return bcrypt.compare(this.sha256(data), hash);
    }
    verifySha256(token: string, hash: string): boolean {
        return crypto.timingSafeEqual(
            Buffer.from(this.sha256(token), "hex"),
            Buffer.from(hash, "hex"),
        );
    }
}
