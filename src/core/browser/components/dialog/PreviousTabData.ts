import { KIXObjectType } from "../../../model";

export class PreviousTabData {

    public constructor(
        public objectType: KIXObjectType,
        public tabId: string
    ) { }
}
