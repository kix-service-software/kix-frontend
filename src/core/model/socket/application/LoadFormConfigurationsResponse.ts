import { ISocketResponse } from "../../socket";
import { KIXObjectType } from "../../kix";
import { FormContext, Form } from "../../components";

export class LoadFormConfigurationsResponse implements ISocketResponse {

    public constructor(
        public requestId: string,
        public forms: Form[],
        public formIDsWithContext: Array<[FormContext, KIXObjectType, string]>
    ) { }

}
