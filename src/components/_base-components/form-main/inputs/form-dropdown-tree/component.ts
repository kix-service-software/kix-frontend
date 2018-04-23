import { FormDropdownTreeComponentState } from "./FormDropdownTreeComponentState";
import { FormDropdownItem, ObjectIcon, TreeNode } from "@kix/core/dist/model";

class FormDropdownTreeComponent {

    private state: FormDropdownTreeComponentState;

    public onCreate(input: any): void {
        this.state = new FormDropdownTreeComponentState();
    }

    public onInput(input: any): void {
        this.state.nodes = input.nodes;
    }

    public onMount(): void {
        document.addEventListener("click", (event) => {
            let element: any = event.target;

            if (element.id !== 'tree-expand') {
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
            }
        });
    }

    private toggleList(close: boolean = true): void {
        if (this.state.expanded && close) {
            this.state.expanded = false;
        } else {
            this.state.expanded = true;
        }
    }

    private nodeClicked(node: TreeNode): void {
        this.state.selectedNode = node;
        this.toggleList();
    }

    private itemHovered(item: TreeNode): void {
        this.state.preSelectedNode = item;
    }

    private removeSelectedItem(): void {
        this.state.selectedNode = null;
        this.toggleList();
    }

    private isSelected(item: FormDropdownItem): boolean {
        return this.state.preSelectedNode && this.state.preSelectedNode.id === item.id;
    }

    private hasIconClass(icon: any): boolean {
        return !(icon instanceof ObjectIcon);
    }
}

module.exports = FormDropdownTreeComponent;
