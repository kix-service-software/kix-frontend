import { FormInputComponentState, CreateLinkDescription } from "@kix/core/dist/model";

export class LinkTicketComponentState extends FormInputComponentState {

    public constructor(
        public linkDescriptions: CreateLinkDescription[] = []
    ) {
        super();
    }

}
