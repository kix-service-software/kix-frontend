import { TicketInputArchiveSearchComponentState } from "./TicketInputArchiveSearchCompontentState";
import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState,
    FormFieldValue, ArchiveFlag, FormInputComponent
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class TicketInputArchiveSearch extends FormInputComponent<number, TicketInputArchiveSearchComponentState> {

    public onCreate(): void {
        this.state = new TicketInputArchiveSearchComponentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        this.state.items = [
            new FormDropdownItem(ArchiveFlag.ALL, '', 'Alle Tickets'),
            new FormDropdownItem(ArchiveFlag.ARCHIVED, '', 'Archivierte Tickets'),
            new FormDropdownItem(ArchiveFlag.NOT_ARCHIVED, '', 'Nicht archivierte Tickets')
        ];
    }

    protected setCurrentValue(): void {
        //
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(Number(item.id));
    }
}

module.exports = TicketInputArchiveSearch;
