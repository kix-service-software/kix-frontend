import { ComponentState } from "./ComponentState";
import { FormDropdownItem, ObjectIcon, TreeNode, AutoCompleteConfiguration } from "@kix/core/dist/model";

class Component {

    private state: ComponentState;

    private keepExpanded: boolean = false;
    private timeout: any;
    private currentSearchValue: string;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.enabled = typeof input.enabled !== 'undefined' ? input.enabled : true;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
        this.state.asAutocomplete = typeof input.autocomplete !== 'undefined' ? input.autocomplete : false;
        this.state.asMultiselect = typeof input.multiselect !== 'undefined' ? input.multiselect : false;
        this.state.nodes = typeof input.nodes !== 'undefined' ? input.nodes : [];
        this.state.selectedNodes = typeof input.selectedNodes !== 'undefined' ? input.selectedNodes : [];
        if (!this.state.asMultiselect && this.state.selectedNodes.length > 1) {
            this.state.selectedNodes.splice(1);
        }
        if (this.state.asAutocomplete) {
            this.state.autoCompleteConfiguration = input.autoCompleteConfiguration || new AutoCompleteConfiguration();
            this.state.searchCallback = input.searchCallback;
        }
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
        if (this.state.expanded && close) {
            this.state.expanded = false;
        } else if (this.state.enabled) {
            this.state.expanded = true;
            this.timeout = setTimeout(this.setDropdownStyle.bind(this), 100);
        }
    }

    private listButtonClicked(): void {
        if (this.state.expanded) {
            this.toggleList();
        } else {
            this.focusInput();
        }
    }

    private nodeToggled(): void {
        this.focusInput();
    }

    private focusInput(): void {
        const input = (this as any).getEl('form-list-input');
        if (input) {
            input.focus();
        }
    }

    private focusLost(): void {
        // this.nodeClicked(this.state.preSelectedNode);
        // this.toggleList();
    }

    private keyDown(event: any): void {
        // if (this.state.expanded) {
        //     if (event.key === 'Escape') {
        //         this.toggleList();
        //     } else if (event.key === 'Enter' || event.key === 'Tab') {
        //         event.stopPropagation();
        //         event.preventDefault();
        //         this.nodeClicked(this.state.preSelectedNodes);
        //     }
        // }
    }

    private keyUp(event: any): void {
        // if (!this.state.expanded && event.key !== 'Escape' && event.key !== 'Enter' && event.key !== 'Tab') {
        //     this.toggleList();
        // }

        if (!this.state.selectedNodes && !this.navigationKeyPressed(event)) {
            this.state.filterValue = event.target.value;
            if (this.state.asAutocomplete && this.state.filterValue && this.state.searchCallback) {
                this.startSearch();
            }
        }
    }

    private navigationKeyPressed(event: any): boolean {
        return event.key === 'ArrowLeft'
            || event.key === 'ArrowRight'
            || event.key === 'ArrowUp'
            || event.key === 'ArrowDown'
            || event.key === 'Tab'
            || event.key === 'Escape'
            || event.key === 'Enter';
    }

    private nodeClicked(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        } else {
            this.state.selectedNodes.push(node);
        }
        this.state.filterValue = null;
        (this as any).emit('itemsChanged', this.state.selectedNodes);
    }

    private removeSelectedItem(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        }
        if (!this.state.selectedNodes.length) {
            this.state.filterValue = null;
            const input = (this as any).getEl('form-list-input');
            if (input) {
                input.focus();
            }
        }
    }

    private startSearch(): void {
        if (this.timeout && !this.state.isLoading) {
            window.clearTimeout(this.timeout);
            this.timeout = null;
        }
        const hasMinLength = this.state.filterValue.length >= this.state.autoCompleteConfiguration.charCount;
        if (this.state.filterValue && hasMinLength && !this.state.isLoading) {
            this.currentSearchValue = this.state.filterValue;
            this.timeout = setTimeout(this.loadData.bind(this), this.state.autoCompleteConfiguration.delay);
        } else {
            this.state.nodes = [];
        }
    }

    private async loadData(): Promise<void> {
        this.state.isLoading = true;
        this.state.expanded = true;
        this.state.nodes = await this.state.searchCallback(
            this.state.autoCompleteConfiguration.limit, this.state.filterValue
        );
        this.state.isLoading = false;
        this.timeout = null;

        // if (this.currentSearchValue !== this.state.filterValue) {
        //     this.startSearch();
        // }
    }

    private setDropdownStyle(): void {
        const dropdownInputList = document.getElementById('tree-' + this.state.treeId);
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
        this.state.treeStyle = 'transform: translate(0px,-' + transformValue + 'px)';
    }
}

module.exports = Component;
