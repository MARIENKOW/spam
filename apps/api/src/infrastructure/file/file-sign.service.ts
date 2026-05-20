import { Injectable } from "@nestjs/common";
import { signPath, verifyPath } from "./file-sign.utils";

@Injectable()
export class FileSignService {
    sign = signPath;
    verify = verifyPath;
}
