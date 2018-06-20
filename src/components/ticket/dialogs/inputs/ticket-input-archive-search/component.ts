import { TicketInputArchiveSearchComponentState } from "./TicketInputArchiveSearchCompontentState";
import { FormDropdownItem, ArchiveFlag, FormInputComponent } from "@kix/core/dist/model";


class TicketInputArchiveSearch extends FormInputComponent<number, TicketInputArchiveSearchComponentState> {

    public onCreate(): void {
        this.state = new TicketInputArchiveSearchComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        this.state.items = [
            new FormDropdownItem(ArchiveFlag.ALL, '', 'Alle Tickets'),
            new FormDropdownItem(ArchiveFlag.ARCHIVED, '', 'Archivierte Tickets'),
            new FormDropdownItem(ArchiveFlag.NOT_ARCHIVED, '', 'Nicht archivierte Tickets')
        ];
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        //
    }

    public itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? Number(item.id) : null);
    }
}

module.exports = TicketInputArchiveSearch;
