import { TreeComponentState } from './TreeComponentState';
import { TreeUtil, TreeNode } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

class TreeComponent {

    private state: TreeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeComponentState();
    }

    public onInput(input: any): void {
        this.state.nodes = input.nodes;
        this.state.filterValue = input.filterValue;
        this.state.treeId = input.treeId ? input.treeId + '-tree' : 'tree-' + IdService.generateDateBasedId();
        TreeUtil.linkTreeNodes(this.state.nodes, this.state.filterValue);
        this.state.activeNodes = input.activeNodes;
        (this as any).setStateDirty('activeNodes');
        this.state.treeStyle = input.treeStyle;
    }

    public onMount(): void {
        this.state.treeParent = (this as any).getEl(this.state.treeId).parentElement;
    }

    private nodeToggled(node: TreeNode): void {
        TreeUtil.linkTreeNodes(this.state.nodes, this.state.filterValue);
        (this as any).emit('nodeToggled', node);
    }

    private nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    private nodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }
}

module.exports = TreeComponent;
