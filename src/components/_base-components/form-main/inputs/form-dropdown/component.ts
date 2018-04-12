import { FormDropDownComponentState } from "./FormDropDownComponentState";
import { FormDropDownItem } from "@kix/core/dist/model";
import { NOTFOUND } from "dns";

class FormDropDownComponent {

    private state: FormDropDownComponentState;

    public onCreate(input: any): void {
        this.state = new FormDropDownComponentState();

        this.state.items = [
            { icon: 'kix-icon-unknown', label: 'Testeintrag' },
            { icon: 'kix-icon-check', label: 'Blah' },
            { icon: 'kix-icon-call', label: 'dsfsdfsdfsdfdsfs' },
            { icon: 'kix-icon-checklist', label: 'sdfsdfdsf' },
            { icon: 'kix-icon-calendar', label: 'dsf' },
            { icon: 'kix-icon-circle-prior', label: 'asffsdfsdf' },
            { icon: 'kix-icon-cmdb', label: 'cmdb' }
        ];
        this.state.filteredItems = this.state.items;
    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            let element: any = event.target;

            let foundId = false;
            while (element !== null) {
                const dropDownId = element.getAttribute('dropDownId');
                if (dropDownId) {
                    if (dropDownId !== this.state.dropdownId) {
                        this.state.expanded = false;
                    }
                    foundId = true;
                    break;
                }
                element = element.parentElement;
            }

            if (!foundId) {
                this.state.expanded = false;
            }
        });
    }

    private toggleList(): void {
        this.state.expanded = !this.state.expanded;
        this.resetFilter();
    }

    private itemSelected(item: FormDropDownItem): void {
        this.state.selectedItem = item;
        this.resetFilter();
    }

    private removeSelectedItem(): void {
        this.state.selectedItem = null;
    }

    private filterValueChanged(event: any): void {
        this.state.filterValue = event.target.value;

        if (this.state.filterValue && this.state.filterValue !== '') {
            this.state.filteredItems = this.state.items.filter(
                (i) => i.label.toLocaleLowerCase().indexOf(this.state.filterValue.toLocaleLowerCase()) !== -1
            );
        } else {
            this.resetFilter();
        }

        (this as any).setStateDirty('filterValue');
    }

    private resetFilter(): void {
        this.state.filterValue = null;
        this.state.filteredItems = this.state.items;
    }

}

module.exports = FormDropDownComponent;
