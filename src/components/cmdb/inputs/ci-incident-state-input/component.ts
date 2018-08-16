import { ComponentState } from "./ComponentState";
import { ContextService } from "@kix/core/dist/browser/context";
import { ObjectIcon, TreeNode, FormInputComponent, GeneralCatalogItem } from "@kix/core/dist/model";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        this.state.nodes = this.prepareTree(objectData.ciIncidentStates);
        this.setCurrentNode();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
            super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
        }
    }

    private prepareTree(items: GeneralCatalogItem[]): TreeNode[] {
        let nodes = [];
        if (items) {
            nodes = items.map((gcItem: GeneralCatalogItem) => {
                const treeNode = new TreeNode(
                    gcItem.ItemID, gcItem.Name,
                    new ObjectIcon('ItemID', gcItem.ItemID),
                    null
                );
                return treeNode;
            });
        }
        return nodes;
    }

    public incidentChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);

    }

}

module.exports = Component;
