import { ComponentState } from './ComponentState';
import { TreeUtil, TreeNode } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

class TreeComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree;
        this.state.filterValue = input.filterValue;
        this.state.treeId = input.treeId ? 'tree-' + input.treeId : 'tree-' + IdService.generateDateBasedId();
        TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue);
        this.state.activeNode = input.activeNode;
        this.state.treeStyle = input.treeStyle;
    }

    public onMount(): void {
        this.state.treeParent = (this as any).getEl().parentElement;
    }

    public nodeToggled(node: TreeNode): void {
        TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue);
        (this as any).emit('nodeToggled', node);
    }

    public nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    public nodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

    public getTreeDOMElement(): any {
        return (this as any).getEl();
    }
}

module.exports = TreeComponent;
