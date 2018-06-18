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
        this.state.nodes = typeof input.nodes !== 'undefined' ? input.nodes : this.state.nodes;
        this.state.selectedNodes = typeof input.selectedNodes !== 'undefined' ?
            input.selectedNodes : this.state.selectedNodes;
        this.state.selectedNodes = this.state.selectedNodes.filter((n) => n && typeof n.id !== 'undefined');
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
                this.toggleList();
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
            if (this.state.selectedNodes.length && this.state.selectedNodes.length) {
                this.toggleList(false);
            } else {
                this.focusInput();
            }
        }
    }

    private nodeToggled(): void {
        this.focusInput();
    }

    private focusInput(): void {
        const input = (this as any).getEl('form-list-input-' + this.state.listId);
        if (input) {
            input.focus();
        }
    }

    // TODO: kann ggf. entfallen
    private focusLost(): void {
        // this.nodeClicked(this.state.preSelectedNode);
        // this.toggleList();
    }

    // TODO: Tastatur-Steuerung wieder aktivieren und korrigieren (input nicht mehr vorhanden bei "expanded")
    private keyDown(event: any): void {
        // if (this.state.expanded) {
        //     if (event.key === 'Escape' || event.key === 'Tab') {
        //         this.toggleList();
        //     } else if (event.key === 'Enter' || event.key === 'Tab') {
        //         event.stopPropagation();
        //         event.preventDefault();
        //         this.nodeClicked(this.state.preSelectedNodes);
        //     }
        // }
    }

    private keyUp(event: any): void {
        // TODO: Tastatur-Steuerung wieder aktivieren und korrigieren
        // if (!this.state.expanded && event.key !== 'Escape' && event.key !== 'Enter' && event.key !== 'Tab') {
        //     this.toggleList();
        // }

        if (!this.state.selectedNodes.length && !this.navigationKeyPressed(event)) {
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
            if (!this.state.asMultiselect) {
                this.state.selectedNodes = [node];
                this.toggleList();
            } else {
                this.state.selectedNodes.push(node);
            }
        }
        if (this.state.selectedNodes.length) {
            this.state.filterValue = null;
        }
        (this as any).setStateDirty('selectedNodes');
        (this as any).emit('nodesChanged', this.state.selectedNodes);
    }

    private removeSelectedItem(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        }
        if (!this.state.selectedNodes.length) {
            this.state.filterValue = null;
            this.focusInput();
        }
        (this as any).setStateDirty('selectedNodes');
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
    }

    private setDropdownStyle(): void {
        const dropdownInputList = document.getElementById(this.state.treeId + '-tree');
        let transformValue = 0;
        if (dropdownInputList) {
            const dropdownInputContainer = (this as any).getEl('form-list-input-container-' + this.state.listId);
            let container = dropdownInputContainer;
            let previousContainer;
            while (container
                && container.parentNode
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

    private getAutocompleteNotFoundText(): string {
        const objectName = this.state.autoCompleteConfiguration.noResultsObjectName || 'Objekte';
        return `Keine ${objectName} gefunden (mind. ${this.state.autoCompleteConfiguration.charCount} ` +
            'Zeichen für die Suche eingeben).';
    }
}

module.exports = Component;
