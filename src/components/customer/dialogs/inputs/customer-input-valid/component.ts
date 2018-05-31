import { ContextService } from "@kix/core/dist/browser/context";
import {
    FormDropdownItem, ObjectIcon, TicketProperty, FormInputComponentState,
    FormFieldValue, ArchiveFlag, FormInputComponent, ValidObject
} from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";
import { CompontentState } from "./CompontentState";

// TODO: als allgemeines input-valid implementieren
class Component extends FormInputComponent<number, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public onInput(input: any): void {
        FormInputComponent.prototype.onInput.call(this, input);
    }

    public onMount(): void {
        FormInputComponent.prototype.onMount.call(this);
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.validObjects.map((vo) => new FormDropdownItem(vo.ID, '', vo.Name));
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        //
    }

    private itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? Number(item.id) : null);
    }
}

module.exports = Component;
