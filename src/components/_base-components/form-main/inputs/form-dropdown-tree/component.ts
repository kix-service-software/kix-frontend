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

    private focusInput(): void {
        if (this.state.expanded) {
            this.toggleList();
        } else {
            const input = (this as any).getEl('dropdown-tree-input');
            if (input) {
                input.focus();
            }
        }
    }

    private keyDown(event: any): void {
        if (this.state.expanded && event.key === 'Tab') {
            if (this.state.preSelectedNode) {
                this.nodeClicked(this.state.preSelectedNode);
                this.state.preSelectedNode = null;
            } else {
                this.toggleList();
            }
        }
    }

    private keyUp(event: any): void {
        this.state.filterValue = event.target.value;
    }

    private nodeToggled(): void {
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
