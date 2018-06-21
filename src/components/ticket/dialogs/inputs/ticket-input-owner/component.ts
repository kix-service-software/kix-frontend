import { TicketInputOwnerComponentState } from "./TicketInputOwnerComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputOwnerComponent extends FormInputComponent<number, TicketInputOwnerComponentState> {

    public onCreate(): void {
        this.state = new TicketInputOwnerComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.agents.map((a) => new FormDropdownItem(a.UserID, 'kix-icon-man', a.UserFullname));
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            if (value) {
                this.state.currentItem = this.state.items.find((i) => i.id === value.value);
            }
        }
        this.setCurrentValue();
    }

    public itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? Number(item.id) : null);
    }

}

module.exports = TicketInputOwnerComponent;
