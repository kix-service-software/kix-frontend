import { FormService } from "@kix/core/dist/browser";
import { FormContext, KIXObjectType } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public formId: string = FormService.getInstance().getFormIdByContext(FormContext.SEARCH, KIXObjectType.CUSTOMER)
    ) { }

}
