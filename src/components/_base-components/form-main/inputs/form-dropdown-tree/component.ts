import { FormDropdownTreeComponentState } from "./FormDropdownTreeComponentState";
import { FormDropdownItem, ObjectIcon, TreeNode } from "@kix/core/dist/model";

class FormDropdownTreeComponent {

    private state: FormDropdownTreeComponentState;

    private keepExpanded: boolean = false;
    private timeout: any;
    private delay: number;

    public onCreate(input: any): void {
        this.state = new FormDropdownTreeComponentState();
    }

    public onInput(input: any): void {
        this.state.nodes = input.nodes;
        this.state.selectedNode = input.selectedNode;
        this.state.preSelectedNode = input.selectedNode;
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
            this.state.preSelectedNode = this.state.selectedNode;
            this.timeout = setTimeout(this.getDropdownStyle.bind(this), this.delay);
        }
    }

    private dropdownClicked(): void {
        if (this.state.expanded) {
            this.toggleList();
        } else {
            this.focusInput();
        }
    }

    private nodeToggled(): void {
        this.focusInput();
    }

    private keyDown(event: any): void {
        if (this.state.expanded) {
            if (event.key === 'Escape') {
                this.toggleList();
            } else if (event.key === 'Enter' || event.key === 'Tab') {
                event.stopPropagation();
                event.preventDefault();
                this.nodeClicked(this.state.preSelectedNode);
            }
        }
    }

    private keyUp(event: any): void {
        if (!this.state.expanded && event.key !== 'Escape' && event.key !== 'Enter' && event.key !== 'Tab') {
            this.toggleList();
        }

        if (!this.state.selectedNode && !this.navigationKeyPressed(event)) {
            this.state.filterValue = event.target.value;
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

    private focusInput(): void {
        const input = (this as any).getEl('dropdown-tree-input');
        if (input) {
            input.focus();
        }
    }

    private nodeClicked(node: TreeNode): void {
        this.state.selectedNode = node;
        this.state.filterValue = null;
        this.toggleList();
        (this as any).emit('itemChanged', node);
    }

    private nodeHovered(node: TreeNode): void {
        this.state.preSelectedNode = node;
    }

    private removeSelectedItem(): void {
        this.state.selectedNode = null;
        this.state.filterValue = null;
        this.nodeClicked(null);
        const input = (this as any).getEl('dropdown-tree-input');
        if (input) {
            input.focus();
        }
    }

    private isSelected(item: FormDropdownItem): boolean {
        return this.state.preSelectedNode && this.state.preSelectedNode.id === item.id;
    }

    private hasIconClass(icon: any): boolean {
        return !(icon instanceof ObjectIcon);
    }

    private focusLost(): void {
        // this.nodeClicked(this.state.preSelectedNode);
        // this.closeList();
    }

    private closeList(): void {
        this.state.expanded = false;
        this.state.preSelectedNode = null;
    }

    private getDropdownStyle(): void {
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

module.exports = FormDropdownTreeComponent;
