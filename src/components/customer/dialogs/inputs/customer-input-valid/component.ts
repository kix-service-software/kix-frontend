import { ContextService } from "@kix/core/dist/browser/context";
import { FormDropdownItem, FormInputComponent } from "@kix/core/dist/model";
import { CompontentState } from "./CompontentState";

// TODO: als allgemeines input-valid implementieren
class Component extends FormInputComponent<number, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.items = objectData.validObjects.map((vo) => new FormDropdownItem(vo.ID, '', vo.Name));
        this.setCurrentValue();
    }

    protected setCurrentValue(): void {
        return;
    }

    public itemChanged(item: FormDropdownItem): void {
        this.state.currentItem = item;
        super.provideValue(item ? Number(item.id) : null);
    }
}

module.exports = Component;
