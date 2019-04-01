import { ISocketRequest } from "../../../socket";

export class LoadContextConfigurationRequest implements ISocketRequest {


    public constructor(
        public token: string,
        public requestId: string,
        public clientRequestId: string,
        public contextId: string
    ) { }

}
