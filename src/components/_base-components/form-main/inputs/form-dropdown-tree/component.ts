import { FormDropdownTreeComponentState } from "./FormDropdownTreeComponentState";
import { FormDropdownItem, ObjectIcon, TreeNode } from "@kix/core/dist/model";

class FormDropdownTreeComponent {

    private state: FormDropdownTreeComponentState;

    public onCreate(input: any): void {
        this.state = new FormDropdownTreeComponentState();
    }

    public onInput(input: any): void {
        this.state.nodes = input.nodes;
        this.state.filteredNodes = input.items;
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

    private toggleList(): void {
        this.state.expanded = !this.state.expanded;
        this.resetFilter();
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
    }

    private filterValueChanged(event: any): void {
        if (!this.navigationKeyPressed(event)) {
            this.state.filterValue = event.target.value;

            if (this.state.filterValue && this.state.filterValue !== '') {
                this.state.filteredNodes = this.state.nodes.filter(
                    (i) => i.label.toLocaleLowerCase().indexOf(this.state.filterValue.toLocaleLowerCase()) !== -1
                );
            } else {
                this.resetFilter();
            }

            this.state.preSelectedNode = null;
            this.keyDown({ keyCode: 40 });
        }

        (this as any).setStateDirty('filterValue');
    }

    private resetFilter(): void {
        this.state.filterValue = null;
        this.state.filteredNodes = this.state.nodes;
    }

    private keyDown(event: any): void {
        if (this.state.expanded && this.navigationKeyPressed(event)) {
            switch (event.keyCode) {
                case 40: // down
                    if (this.state.preSelectedNode) {
                        this.navigate();
                    } else if (this.state.filteredNodes && this.state.filteredNodes.length) {
                        this.state.preSelectedNode = this.state.filteredNodes[0];
                    }
                    break;
                case 38: // up
                    if (this.state.preSelectedNode) {
                        this.navigate(true);
                    } else if (this.state.filteredNodes && this.state.filteredNodes.length) {
                        this.state.preSelectedNode = this.state.filteredNodes[this.state.filteredNodes.length - 1];
                    }
                    break;
                case 13: // enter
                    this.nodeClicked(this.state.preSelectedNode);
                    this.state.preSelectedNode = null;
                    this.toggleList();
                    break;
                default:
            }
        }
    }

    private navigate(up: boolean = false): void {
        const selectionIndex = this.state.filteredNodes.findIndex(
            (fi) => fi.id === this.state.preSelectedNode.id
        );

        if (selectionIndex !== -1) {
            const newIndex = up ? selectionIndex - 1 : selectionIndex + 1;
            if (this.state.filteredNodes[newIndex]) {
                this.state.preSelectedNode = this.state.filteredNodes[newIndex];
            }
        }

        const element = document.getElementById(this.state.dropdownId + '-item-' + this.state.preSelectedNode.id);
        element.scrollIntoView(true);
    }


    private navigationKeyPressed(event: any): boolean {
        return event.keyCode === 13 || event.keyCode === 33 || event.keyCode === 34
            || event.keyCode === 38 || event.keyCode === 40;
    }

    private isSelected(item: FormDropdownItem): boolean {
        return this.state.preSelectedNode && this.state.preSelectedNode.id === item.id;
    }

    private hasIconClass(icon: any): boolean {
        return !(icon instanceof ObjectIcon);
    }
}

module.exports = FormDropdownTreeComponent;
