import { TreeComponentState } from './TreeComponentState';
import { TreeUtil, TreeNode } from '@kix/core/dist/model';

class TreeComponent {

    private state: TreeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree;
        this.state.filterValue = input.filterValue;
        TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue);
        this.state.activeNode = input.activeNode;
    }

    public onMount(): void {
        this.state.treeParent = (this as any).getEl(this.state.treeId).parentElement;
        if (!this.state.activeNode) {
            this.state.activeNode = TreeUtil.getFirstVisibleNode(this.state.tree, this.state.filterValue);
        }
    }

    private nodeToggled(node: TreeNode): void {
        TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue);
        (this as any).emit('nodeToggled', node);
    }

    private nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    private nodeHovered(node: TreeNode): void {
        this.state.activeNode = node;
        (this as any).emit('nodeHovered', node);
    }

}

module.exports = TreeComponent;
