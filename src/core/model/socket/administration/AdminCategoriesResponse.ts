import { ISocketResponse } from "../ISocketResponse";
import { AdminModuleCategory } from "../../admin";

export class AdminCategoriesResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public categories: AdminModuleCategory[]
    ) { }

}
