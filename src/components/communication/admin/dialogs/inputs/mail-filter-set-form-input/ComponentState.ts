import { FormInputComponentState } from "../../../../../../core/model";
import { MailFilterSetManager } from "../../../../../../core/browser/mail-filter";

export class ComponentState extends FormInputComponentState<any[]> {

    public constructor(
        public setManager: MailFilterSetManager = null,
        public translations: Map<string, string> = new Map(),
    ) {
        super();
    }

}
