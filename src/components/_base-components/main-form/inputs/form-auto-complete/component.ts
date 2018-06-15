import { FormAutoCompleteComponentState } from "./FormAutoCompleteComponentState";
import { FormDropdownItem, ObjectIcon, AutoCompleteConfiguration } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser/form";

class FormAutoCompleteComponent {

    private state: FormAutoCompleteComponentState;

    private keepExpanded: boolean = false;
    private timeout: any;
    private currentSearchValue: string;

    private delay: number;

    public onCreate(input: any): void {
        this.state = new FormAutoCompleteComponentState();
    }

    public onInput(input: any): void {
        this.state.autoCompleteConfiguration = input.autoCompleteConfiguration || new AutoCompleteConfiguration();
        this.state.searchCallback = input.searchCallback;
        this.state.selectedItem = input.selectedItem;
        this.state.preSelectedItem = null;
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
            this.state.expanded = false;
            this.state.preSelectedItem = null;
            this.resetFilter();
        } else if (this.state.enabled) {
            this.state.expanded = true;
            this.state.preSelectedItem = this.state.selectedItem;
            this.timeout = setTimeout(this.getDropdownStyle.bind(this), this.delay);
        }
    }

    private itemSelected(item: FormDropdownItem): void {
        this.state.selectedItem = item;
        this.state.items = [];
        this.toggleList();
        (this as any).emit('itemChanged', item);
    }

    private itemHovered(item: FormDropdownItem): void {
        this.state.preSelectedItem = item;
    }

    private removeSelectedItem(): void {
        this.state.selectedItem = null;
        this.itemSelected(null);
        const input = (this as any).getEl('dropdown-auto-complete-input');
        if (input) {
            input.focus();
        }
    }

    private searchValueChanged(event: any): void {
        if (!this.state.expanded && event.key !== 'Escape' && event.key !== 'Enter' && event.key !== 'Tab') {
            this.toggleList();
        }
        if (!this.navigationKeyPressed(event)) {
            this.state.searchValue = event.target.value;
            this.startSearch();
        }
    }

    private startSearch(): void {
        const hasMinLength = this.state.searchValue.length >= this.state.autoCompleteConfiguration.charCount;
        if (this.state.searchValue && hasMinLength && !this.state.isLoading) {
            this.currentSearchValue = this.state.searchValue;
            window.clearTimeout(this.timeout);
            this.timeout = setTimeout(this.loadData.bind(this), this.state.autoCompleteConfiguration.delay);
        } else {
            this.state.items = [];
        }
    }

    private async loadData(): Promise<void> {
        this.state.isLoading = true;
        this.state.expanded = true;
        if (this.state.searchCallback) {
            this.state.items = await this.state.searchCallback(
                this.state.autoCompleteConfiguration.limit, this.state.searchValue
            );

            this.state.isLoading = false;

            if (this.currentSearchValue !== this.state.searchValue) {
                this.startSearch();
            }
        }
    }

    private resetFilter(): void {
        this.state.searchValue = null;
    }

    private keyDown(event: any): void {
        if (this.state.expanded && this.navigationKeyPressed(event)) {
            switch (event.key) {
                case 'ArrowDown':
                    if (this.state.preSelectedItem) {
                        this.navigate();
                    } else if (this.state.items && this.state.items.length) {
                        this.state.preSelectedItem = this.state.items[0];
                    }
                    break;
                case 'ArrowUp':
                    if (this.state.preSelectedItem) {
                        this.navigate(true);
                    } else if (this.state.items && this.state.items.length) {
                        this.state.preSelectedItem = this.state.items[this.state.items.length - 1];
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
                    this.state.preSelectedItem = null;
                    break;
                case 'Escape':
                    this.state.preSelectedItem = null;
                    this.toggleList();
                    break;
                default:
            }
        }
    }

    private navigate(up: boolean = false): void {
        const selectionIndex = this.state.items.findIndex(
            (fi) => fi.id === this.state.preSelectedItem.id
        );

        if (selectionIndex !== -1) {
            const newIndex = up ? selectionIndex - 1 : selectionIndex + 1;
            if (this.state.items[newIndex]) {
                this.state.preSelectedItem = this.state.items[newIndex];
            }
        }

        const element = document.getElementById(this.state.dropdownId + '-item-' + this.state.preSelectedItem.id);
        element.scrollIntoView(true);
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
        (this as any).emit('itemChanged', this.state.selectedItem);
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
                transformValue = containerElementDOMRect.height + dropdownListDOMRect.height;
            } else {
                transformValue = 0;
            }

        }
        this.state.dropdownListStyle = 'transform: translate(0px,-' + transformValue + 'px)';
    }
}

module.exports = FormAutoCompleteComponent;
