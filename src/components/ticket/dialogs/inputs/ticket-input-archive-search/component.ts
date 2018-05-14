import { TicketInputArchiveSearchComponentState } from "./TicketInputArchiveSearchCompontentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState, FormFieldValue, ArchiveFlag
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputArchiveSearch {

    private state: TicketInputArchiveSearchComponentState;

    public onCreate(): void {
        this.state = new TicketInputArchiveSearchComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        this.state.items = [
            new FormDropdownItem(ArchiveFlag.ALL, '', 'Alle Tickets'),
            new FormDropdownItem(ArchiveFlag.ARCHIVED, '', 'Archivierte Tickets'),
            new FormDropdownItem(ArchiveFlag.NOT_ARCHIVED, '', 'Nicht archivierte Tickets')
        ];
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        const formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        formInstance.provideFormFieldValue(this.state.field.property, new FormFieldValue<number>(Number(item.id)));
    }
}

module.exports = TicketInputArchiveSearch;
