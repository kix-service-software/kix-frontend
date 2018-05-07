import { FormInputComponentState } from "@kix/core/dist/model";

export class LinkTicketComponentState extends FormInputComponentState {

    public constructor(
        public minimized: boolean = false
    ) {
        super();
    }

}
