import { TicketInputTypeComponentState } from "./TicketInputTypeComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputTypeComponent extends FormInputComponent<number, TicketInputTypeComponentState> {

    public onCreate(): void {
        this.state = new TicketInputTypeComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.ticketTypes.map((t) =>
            new FormDropdownItem(t.ID, new ObjectIcon(TicketProperty.TYPE_ID, t.ID), t.Name)
        );
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        const fieldValue = formInstance.getFormFieldValue(this.state.field.property);
        this.state.currentItem = this.state.items.find((i) => i.id === fieldValue.value);
    }

    public itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? Number(item.id) : null);
    }

}

module.exports = TicketInputTypeComponent;
