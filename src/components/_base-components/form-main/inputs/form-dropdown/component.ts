import { FormDropdownComponentState } from "./FormDropdownComponentState";
import { FormDropdownItem, ObjectIcon } from "@kix/core/dist/model";

class FormDropdownComponent {

    private state: FormDropdownComponentState;

    private keepExpanded: boolean = false;

    private timeout: any;
    private delay: number;

    public onCreate(input: any): void {
        this.state = new FormDropdownComponentState();
    }

    public onInput(input: any): void {
        this.state.items = input.items;
        this.state.filteredItems = input.items;
        this.state.selectedItem = input.selectedItem;
        this.state.preSelectedItem = input.selectedItem;
        this.state.enabled = typeof input.enabled !== 'undefined' ? input.enabled : true;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            if (!this.keepExpanded) {
                this.state.expanded = false;
            } else {
                this.keepExpanded = false;
            }
        });
    }

    private setKeepExpanded(): void {
        this.keepExpanded = true;
    }

    private toggleList(close: boolean = true): void {
        this.delay = 100;
        if (this.state.expanded && close) {
            this.closeList();
        } else if (this.state.enabled) {
            this.state.expanded = true;
            this.state.preSelectedItem = this.state.selectedItem;
            this.timeout = setTimeout(this.getDropdownStyle.bind(this), this.delay);
        }
    }

    private dropdownClicked(): void {
        if (this.state.expanded) {
            this.toggleList(true);
        } else {
            this.toggleList();
            this.focusInput();
        }
    }

    private focusInput(): void {
        const input = (this as any).getEl('dropdown-tree-input');
        if (input) {
            input.focus();
        }
    }

    private itemSelected(item: FormDropdownItem): void {
        this.state.selectedItem = item;
        this.toggleList();
        (this as any).emit('itemChanged', item);
    }

    private itemHovered(item: FormDropdownItem): void {
        this.state.preSelectedItem = item;
    }

    private removeSelectedItem(): void {
        this.state.selectedItem = null;
        this.itemSelected(null);
        this.focusInput();
    }

    private filterValueChanged(event: any): void {
        if (!this.state.expanded && event.key !== 'Escape' && event.key !== 'Enter' && event.key !== 'Tab') {
            this.toggleList();
        }
        if (!this.state.selectedItem) {
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
            }

            (this as any).setStateDirty('filterValue');
        }
    }

    private resetFilter(): void {
        this.state.filterValue = null;
        this.state.filteredItems = this.state.items;
    }

    private keyDown(event: any): void {
        if (this.state.expanded && this.navigationKeyPressed(event)) {
            switch (event.key) {
                case 'ArrowDown':
                    if (this.state.preSelectedItem) {
                        this.navigate();
                    } else if (this.state.filteredItems && this.state.filteredItems.length) {
                        this.state.preSelectedItem = this.state.filteredItems[0];
                    }
                    break;
                case 'ArrowUp':
                    if (this.state.preSelectedItem) {
                        this.navigate(true);
                    } else if (this.state.filteredItems && this.state.filteredItems.length) {
                        this.state.preSelectedItem = this.state.filteredItems[this.state.filteredItems.length - 1];
                    }
                    break;
                case 'Tab':
                    if (this.state.preSelectedItem) {
                        this.itemSelected(this.state.preSelectedItem);
                        this.state.preSelectedItem = null;
                    } else {
                        this.toggleList();
                    }
                    break;
                case 'Enter':
                    event.stopPropagation();
                    event.preventDefault();
                    this.itemSelected(this.state.preSelectedItem);
                    break;
                case 'Escape':
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
        element.scrollIntoView();
    }

    private navigationKeyPressed(event: any): boolean {
        return event.key === 'ArrowUp' ||
            event.key === 'ArrowDown' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowRight' ||
            event.key === 'Tab' ||
            event.key === 'Escape' ||
            event.key === 'Enter';
    }

    private isSelected(item: FormDropdownItem): boolean {
        return this.state.preSelectedItem && this.state.preSelectedItem.id === item.id;
    }

    private hasIconClass(icon: any): boolean {
        return !(icon instanceof ObjectIcon);
    }

    private focusLost(): void {
        this.itemSelected(this.state.preSelectedItem);
        this.closeList();
    }

    private closeList(): void {
        this.state.expanded = false;
        this.state.preSelectedItem = null;
        this.resetFilter();
    }

    private getDropdownStyle(): void {
        const dropdownInputList = (this as any).getEl('dropdown-list');
        let transformValue = 0;
        if (dropdownInputList) {
            const dropdownInputContainer = (this as any).getEl('dropdown-input-container');
            const formElement = dropdownInputContainer.parentElement.parentElement.parentElement;

            let container = dropdownInputContainer;
            let previousContainer;
            while (container
                && container.parentNode.className !== 'overlay-dialog'
                && container.parentNode.className !== 'lane-widget') {
                previousContainer = container;
                container = container.parentNode;
            }
            const dropdownListDOMRect = dropdownInputList.getBoundingClientRect();
            const containerElementDOMRect = previousContainer.getBoundingClientRect();
            const dropdownInputContainerDOMRect = dropdownInputContainer.getBoundingClientRect();
            const containerEnd = containerElementDOMRect.top + containerElementDOMRect.height;
            const dropdownListEnd = dropdownInputContainerDOMRect.top
                + dropdownInputContainerDOMRect.height
                + dropdownListDOMRect.height;
            if (containerEnd < dropdownListEnd) {
                transformValue = dropdownInputContainerDOMRect.height + dropdownListDOMRect.height;
            } else {
                transformValue = 0;
            }
        }
        this.state.dropdownListStyle = 'transform: translate(0px,-' + transformValue + 'px)';
    }
}

module.exports = FormDropdownComponent;
