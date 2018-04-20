import { FormDropdownComponentState } from "./FormDropdownComponentState";
import { FormDropdownItem, ObjectIcon } from "@kix/core/dist/model";

class FormDropdownComponent {

    private state: FormDropdownComponentState;
    private preventToggle: boolean = false;

    public onCreate(input: any): void {
        this.state = new FormDropdownComponentState();
    }

    public onInput(input: any): void {
        this.state.items = input.items;
        this.state.filteredItems = input.items;
        this.state.selectedItem = input.selectedItem;
        this.state.preSelectedItem = null;
        this.state.enabled = typeof input.enabled !== 'undefined' ? input.enabled : true;
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
        if (!this.preventToggle) {
            if (this.state.enabled) {
                this.state.expanded = !this.state.expanded;
                this.resetFilter();
            }
        } else {
            this.preventToggle = false;
        }
    }

    private itemSelected(item: FormDropdownItem): void {
        this.state.selectedItem = item;
        this.resetFilter();
        (this as any).emit('itemChanged', item);
    }

    private itemHovered(item: FormDropdownItem): void {
        this.state.preSelectedItem = item;
    }

    private removeSelectedItem(): void {
        this.state.selectedItem = null;
        this.itemSelected(null);
        this.preventToggle = true;
    }

    private filterValueChanged(event: any): void {
        if (!this.navigationKeyPressed(event)) {
            this.state.filterValue = event.target.value;

            if (this.state.filterValue && this.state.filterValue !== '') {
                this.state.filteredItems = this.state.items.filter(
                    (i) => i.label.toLocaleLowerCase().indexOf(this.state.filterValue.toLocaleLowerCase()) !== -1
                );
            } else {
                this.resetFilter();
            }

            this.state.preSelectedItem = null;
            this.keyDown({ keyCode: 40 });
        }

        (this as any).setStateDirty('filterValue');
    }

    private resetFilter(): void {
        this.state.filterValue = null;
        this.state.filteredItems = this.state.items;
    }

    private keyDown(event: any): void {
        if (this.state.expanded && this.navigationKeyPressed(event)) {
            switch (event.keyCode) {
                case 40: // down
                    if (this.state.preSelectedItem) {
                        this.navigate();
                    } else if (this.state.filteredItems && this.state.filteredItems.length) {
                        this.state.preSelectedItem = this.state.filteredItems[0];
                    }
                    break;
                case 38: // up
                    if (this.state.preSelectedItem) {
                        this.navigate(true);
                    } else if (this.state.filteredItems && this.state.filteredItems.length) {
                        this.state.preSelectedItem = this.state.filteredItems[this.state.filteredItems.length - 1];
                    }
                    break;
                case 13: // enter
                    this.itemSelected(this.state.preSelectedItem);
                    this.state.preSelectedItem = null;
                    this.toggleList();
                    break;
                default:
            }
        }
    }

    private navigate(up: boolean = false): void {
        const selectionIndex = this.state.filteredItems.findIndex(
            (fi) => fi.id === this.state.preSelectedItem.id
        );

        if (selectionIndex !== -1) {
            const newIndex = up ? selectionIndex - 1 : selectionIndex + 1;
            if (this.state.filteredItems[newIndex]) {
                this.state.preSelectedItem = this.state.filteredItems[newIndex];
            }
        }

        const element = document.getElementById(this.state.dropdownId + '-item-' + this.state.preSelectedItem.id);
        element.scrollIntoView(true);
    }


    private navigationKeyPressed(event: any): boolean {
        return event.keyCode === 13 || event.keyCode === 33 || event.keyCode === 34
            || event.keyCode === 38 || event.keyCode === 40;
    }

    private isSelected(item: FormDropdownItem): boolean {
        return this.state.preSelectedItem && this.state.preSelectedItem.id === item.id;
    }

    private hasIconClass(icon: any): boolean {
        return !(icon instanceof ObjectIcon);
    }
}

module.exports = FormDropdownComponent;
