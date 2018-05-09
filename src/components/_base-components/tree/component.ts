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
        this.scrollToNode();
    }

    public onMount(): void {
        this.state.treeParent = (this as any).getEl(this.state.treeId).parentElement;
    }

    private nodeToggled(node: TreeNode): void {
        TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue);
        (this as any).emit('nodeToggled', node);
    }

    private nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    private nodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

    private scrollToNode(): void {
        if (this.state.activeNode) {
            const container = document.getElementById(this.state.treeId);
            const element = document.getElementById(this.state.treeId + '-node-' + this.state.activeNode.id);
            if (element && container) {
                if (element.offsetTop < container.scrollTop) {
                    container.scrollTop = element.offsetTop;
                } else {
                    const offsetBottom = element.offsetTop + element.offsetHeight;
                    const scrollBottom = container.scrollTop + container.offsetHeight;
                    if (offsetBottom > scrollBottom) {
                        container.scrollTop = offsetBottom - container.offsetHeight;
                    }
                }
            }
        }
    }

}

module.exports = TreeComponent;
