import { FormDropdownTreeComponentState } from "./FormDropdownTreeComponentState";
import { FormDropdownItem, ObjectIcon, TreeNode } from "@kix/core/dist/model";

class FormDropdownTreeComponent {

    private state: FormDropdownTreeComponentState;

    private keepExpanded: boolean = false;

    public onCreate(input: any): void {
        this.state = new FormDropdownTreeComponentState();
    }

    public onInput(input: any): void {
        this.state.nodes = input.nodes;
        this.state.selectedNode = input.selectedNode;
        this.state.preSelectedNode = input.selectedNode;
        this.state.enabled = typeof input.enabled !== 'undefined' ? input.enabled : true;
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
            this.state.preSelectedNode = null;
        } else if (this.state.enabled) {
            this.state.expanded = true;
            this.state.preSelectedNode = this.state.selectedNode;
        }
    }

    private dropdownClicked(): void {
        if (this.state.expanded) {
            this.state.expanded = false;
            this.state.preSelectedNode = null;
        } else {
            this.state.expanded = true;
            this.state.preSelectedNode = this.state.selectedNode;
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
}

module.exports = FormDropdownTreeComponent;
