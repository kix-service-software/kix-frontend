import { KIXObjectType, FormContext } from "../../../../core/model";
import { FormService, AbstractComponentState } from "../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public formId: string =
            FormService.getInstance().getFormIdByContext(FormContext.SEARCH, KIXObjectType.CONFIG_ITEM)
    ) {
        super();
    }

}
