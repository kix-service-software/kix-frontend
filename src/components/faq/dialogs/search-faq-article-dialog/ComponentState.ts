import { KIXObjectType, FormContext } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser";

export class ComponentState {

    public constructor(
        public formId: string =
            FormService.getInstance().getFormIdByContext(FormContext.SEARCH, KIXObjectType.FAQ_ARTICLE)
    ) { }

}
