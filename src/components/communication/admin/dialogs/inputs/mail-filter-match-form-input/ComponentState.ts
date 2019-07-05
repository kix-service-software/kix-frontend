import { FormInputComponentState } from "../../../../../../core/model";
import { MailFilterMatchManager } from "../../../../../../core/browser/mail-filter";

export class ComponentState extends FormInputComponentState<any[]> {

    public constructor(
        public matchManager: MailFilterMatchManager = null,
        public translations: Map<string, string> = new Map(),
    ) {
        super();
    }

}
