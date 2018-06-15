import { KIXObjectType } from "@kix/core/dist/model";

export class FieldContainerComponentState {

    public constructor(
        public objectType: KIXObjectType = null,
        public formId: string = null
    ) { }

}
