import { TicketInputOwnerComponentState } from "./TicketInputOwnerComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, FormInputComponentState, FormFieldValue, FormInputComponent } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputOwnerComponent extends FormInputComponent<number, TicketInputOwnerComponentState> {

    public onCreate(): void {
        this.state = new TicketInputOwnerComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.agents.map((a) => new FormDropdownItem(a.UserID, 'kix-icon-man', a.UserFullname));
    }

    public setCurrentValue(): void {
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        if (formInstance) {
            const value = formInstance.getFormFieldValue(this.state.field.property);
            if (value) {
                this.state.currentItem = this.state.items.find((i) => i.id === value.value);
            }
        }
        this.setCurrentValue();
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? Number(item.id) : null);
    }

}

module.exports = TicketInputOwnerComponent;
