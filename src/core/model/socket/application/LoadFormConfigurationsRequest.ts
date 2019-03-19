import { ISocketRequest } from "../../socket";

export class LoadFormConfigurationsRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
    ) { }

}
