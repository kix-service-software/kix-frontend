import { ContextService } from "@kix/core/dist/browser/context";
import { FormInputComponent, TreeNode } from "@kix/core/dist/model";
import { CompontentState } from "./CompontentState";

// TODO: als allgemeines input-valid implementieren
class Component extends FormInputComponent<number, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public onMount(): void {
        super.onMount();
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData) {
            this.state.nodes = objectData.validObjects.map((vo) => new TreeNode(vo.ID, vo.Name));
        }
    }

    public validChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? Number(this.state.currentNode.id) : null);
    }
}

module.exports = Component;
