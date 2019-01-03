import { FormService } from "../../../../core/browser";
import { FormContext, KIXObjectType } from "../../../../core/model";

export class ComponentState {

    public constructor(
        public formId: string = FormService.getInstance().getFormIdByContext(FormContext.SEARCH, KIXObjectType.CUSTOMER)
    ) { }

}
