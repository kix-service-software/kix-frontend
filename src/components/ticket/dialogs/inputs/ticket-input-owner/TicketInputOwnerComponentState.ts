import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputOwnerComponentState extends FormInputComponentState {

    public constructor(public items: FormDropdownItem[] = []) {
        super();
    }

}
