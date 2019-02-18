import { ComponentState } from "./ComponentState";
import { TreeNode, AutoCompleteConfiguration } from "../../../../../core/model";
import { SelectionState } from "../../../../../core/browser";

class Component {

    private state: ComponentState;

    private keepExpanded: boolean = false;
    private autocompleteTimeout: any;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.readonly = typeof input.readonly !== 'undefined' ? input.readonly : false;
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
        this.state.asAutocomplete = typeof input.autocomplete !== 'undefined' ? input.autocomplete : false;
        this.state.asMultiselect = typeof input.multiselect !== 'undefined' ? input.multiselect : false;

        if (!this.state.asAutocomplete) {
            this.state.nodes = typeof input.nodes !== 'undefined' ? input.nodes : this.state.nodes;
            this.state.selectedNodes = typeof input.selectedNodes !== 'undefined' ?
                input.selectedNodes : this.state.selectedNodes;
            this.state.selectedNodes = this.state.selectedNodes.filter((n) => n && typeof n.id !== 'undefined');
        }

        if (!this.state.asMultiselect && this.state.selectedNodes.length > 1) {
            this.state.selectedNodes.splice(1);
            (this as any).emit('nodesChanged', this.state.selectedNodes);
        }

        if (this.state.asAutocomplete) {
            this.state.autoCompleteConfiguration = input.autoCompleteConfiguration || new AutoCompleteConfiguration();
            this.state.searchCallback = input.searchCallback;
        }
        this.state.removeNode = typeof input.removeNode !== 'undefined' ? input.removeNode : true;

        this.setCheckState();
    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            if (this.state.expanded) {
                if (this.keepExpanded) {
                    this.keepExpanded = false;
                } else {
                    this.toggleList();
                }
            }
        });

        this.setCheckState();
    }

    public onDestroy(): void {
        document.removeEventListener("click", (event) => {
            if (this.state.expanded) {
                if (this.keepExpanded) {
                    this.keepExpanded = false;
                } else {
                    this.toggleList();
                }
            }
        });
    }

    public setKeepExpanded(): void {
        this.keepExpanded = true;
    }

    private toggleList(close: boolean = true): void {
        if (this.state.expanded && close) {
            this.state.expanded = false;
        } else if (!this.state.readonly) {
            this.state.expanded = true;
            setTimeout(this.setDropdownStyle.bind(this), 100);
        }

        this.state.filterValue = null;
        this.state.autocompleteSearchValue = null;
        if (this.state.asAutocomplete) {
            this.state.nodes = [];
        }
    }

    public listToggleButtonClicked(): void {
        if (this.state.expanded) {
            this.toggleList(true);
        } else {
            this.toggleList(false);
        }
    }

    public nodeToggled(): void {
        this.focusInput();
    }

    private focusInput(): void {
        const input = (this as any).getEl('form-list-input-' + this.state.listId);
        if (input) {
            input.focus();
        }
    }

    public keyDown(event: any): void {
        if (this.state.expanded) {
            if (event.key === 'Escape' || event.key === 'Tab') {
                this.toggleList();
            }
        }
    }

    public keyUp(event: any): void {
        if (!this.navigationKeyPressed(event)) {
            if (this.state.asAutocomplete && typeof event.target.value !== 'undefined' && this.state.searchCallback) {
                this.state.autocompleteSearchValue = event.target.value;
                this.startSearch();
            } else {
                this.state.filterValue = event.target.value;
                setTimeout(() => this.setDropdownStyle(), 50);
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

    public nodeClicked(node: TreeNode): void {
        if (this.state.asMultiselect) {
            this.handleMultiselect(node);
        } else {
            this.handleSingleselect(node);
        }

        if (this.state.selectedNodes.length) {
            this.state.filterValue = null;
        }

        (this as any).emit('nodesChanged', this.state.selectedNodes);
    }

    private handleMultiselect(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        } else {
            this.state.selectedNodes.push(node);
        }
        (this as any).setStateDirty('selectedNodes');
    }

    private handleSingleselect(node: TreeNode): void {
        this.state.selectedNodes = [node];
        this.toggleList();
    }

    public removeSelectedItem(node: TreeNode): void {
        const nodeIndex = this.state.selectedNodes.findIndex((n) => n.id === node.id);
        if (nodeIndex !== -1) {
            this.state.selectedNodes.splice(nodeIndex, 1);
        }
        if (!this.state.selectedNodes.length) {
            this.state.filterValue = null;
            this.focusInput();
        }
        (this as any).setStateDirty('selectedNodes');
        (this as any).emit('nodesChanged', this.state.selectedNodes);
    }

    private startSearch(): void {
        if (this.autocompleteTimeout && !this.state.isLoading) {
            window.clearTimeout(this.autocompleteTimeout);
            this.autocompleteTimeout = null;
        }
        const hasMinLength =
            this.state.autocompleteSearchValue.length >= this.state.autoCompleteConfiguration.charCount;
        if (hasMinLength && !this.state.isLoading) {
            this.autocompleteTimeout = setTimeout(this.loadData.bind(this), this.state.autoCompleteConfiguration.delay);
        } else {
            this.state.nodes = [];
        }
    }

    private async loadData(): Promise<void> {
        this.state.isLoading = true;
        this.state.expanded = true;
        this.state.nodes = await this.state.searchCallback(
            this.state.autoCompleteConfiguration.limit, this.state.autocompleteSearchValue
        );
        this.state.isLoading = false;
        this.autocompleteTimeout = null;

        setTimeout(() => this.setDropdownStyle(), 50);
        this.focusInput();
    }

    private setDropdownStyle(): void {
        const valueList = (this as any).getEl("value-list-" + this.state.treeId);
        let transformValue = 1;
        if (valueList) {
            const formListInputContainer = (this as any).getEl('form-list-input-container-' + this.state.listId);
            let container = formListInputContainer;
            while (container
                && container.parentNode
                && container.parentNode.className !== 'overlay-dialog'
                && container.parentNode.className !== 'lane-widget') {
                container = container.parentNode;
            }
            const containerEnd = container.getBoundingClientRect().top + container.getBoundingClientRect().height;
            const dropdownListEnd = formListInputContainer.getBoundingClientRect().top
                + formListInputContainer.getBoundingClientRect().height
                + valueList.getBoundingClientRect().height;
            if (containerEnd < dropdownListEnd) {
                transformValue
                    = formListInputContainer.getBoundingClientRect().height
                    + valueList.getBoundingClientRect().height
                    - 1;
                this.state.treeStyle = { transform: `translate(0px, -${transformValue}px)` };
            } else {
                this.state.treeStyle = { top: formListInputContainer.getBoundingClientRect().height };
            }
        }
    }

    public getAutocompleteNotFoundText(): string {
        const objectName = this.state.autoCompleteConfiguration.noResultsObjectName || 'Objekte';
        return `Keine ${objectName} gefunden (mind. ${this.state.autoCompleteConfiguration.charCount} ` +
            'Zeichen für die Suche eingeben).';
    }

    public clear(): void {
        this.state.selectedNodes = [];
    }

    public selectAll(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const checkBox = (this as any).getEl('selectAllCheckbox');
        if (checkBox.checked) {
            this.state.selectedNodes = [...this.state.nodes];
        } else {
            this.state.selectedNodes = [];
        }
        (this as any).emit('nodesChanged', this.state.selectedNodes);
    }

    private setCheckState(): void {
        const checkBox = (this as any).getEl('selectAllCheckbox');
        if (checkBox) {
            if (this.state.selectedNodes.length === 0) {
                checkBox.checked = false;
                checkBox.indeterminate = false;
            } else if (this.state.selectedNodes.length === this.state.nodes.length) {
                checkBox.checked = true;
                checkBox.indeterminate = false;
            } else {
                checkBox.checked = false;
                checkBox.indeterminate = true;
            }
        }
    }

    public submit(): void {
        event.stopPropagation();
        event.preventDefault();
        this.toggleList(true);
    }
}

module.exports = Component;
