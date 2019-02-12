import { KIXObjectType } from "../../kix";
import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";
import { ISocketRequest } from "../ISocketRequest";

export class UpdateObjectRequest implements ISocketRequest {

    public constructor(
        public token: string,
        public requestId: string,
        public objectType: KIXObjectType,
        public parameter: Array<[string, any]>,
        public objectId: number | string,
        public updateOptions?: KIXObjectSpecificCreateOptions
    ) { }

}
