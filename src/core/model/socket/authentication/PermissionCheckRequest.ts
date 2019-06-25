import { ISocketRequest } from "../ISocketRequest";
import { UIComponentPermission } from "../../UIComponentPermission";

export class PermissionCheckRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public permissions: UIComponentPermission[]
    ) { }

}
