import { TicketInputOwnerComponentState } from "./TicketInputOwnerComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, FormInputComponentState, FormFieldValue } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputOwnerComponent {

    private state: TicketInputOwnerComponentState;

    public onCreate(): void {
        this.state = new TicketInputOwnerComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.agents.map((a) => new FormDropdownItem(a.UserID, 'kix-icon-man', a.UserFullname));
    }

    private itemChanged(item: FormDropdownItem): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue(this.state.field, new FormFieldValue<number>(Number(item.id)));
    }

}

module.exports = TicketInputOwnerComponent;
