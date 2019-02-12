import { KIXObjectType, FormContext } from "../../../../core/model";
import { FormService } from "../../../../core/browser";

export class ComponentState {

    public constructor(
        public formId: string =
            FormService.getInstance().getFormIdByContext(FormContext.SEARCH, KIXObjectType.CONFIG_ITEM)
    ) { }

}
