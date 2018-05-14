import { FormInputComponentState, CreateLinkDescription } from "@kix/core/dist/model";
import { Label } from "@kix/core/dist/browser/components";

export class LinkTicketComponentState extends FormInputComponentState {

    public constructor(
        public linkDescriptions: CreateLinkDescription[] = [],
        public minimized: boolean = false,
        public labels: Label[] = [],
        public invalid: boolean = false
    ) {
        super();
    }

}
