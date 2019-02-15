import { ComponentState } from './ComponentState';
import { TreeNode, TableTreeNode } from '../../../../core/model';

class TreeNodeComponent {

    private state: ComponentState;
    private hasListener: boolean = false;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
        this.state.filterValue = input.filterValue;
        this.state.activeNode = input.activeNode;
        (this as any).setStateDirty('activeNode');
        this.state.treeId = input.treeId;
        this.state.nodeId = this.state.treeId + '-node-' + this.state.node.id;
        this.state.title = typeof input.title !== 'undefined' ? input.title : false;

        if (!this.hasListener && input.treeParent) {
            this.state.treeParent = input.treeParent;
            this.hasListener = true;
        }
    }

    public onDestroy(): void {
        this.state.node = null;
        this.state.filterValue = null;
    }

    public hasChildren(): boolean {
        return (this.state.node.children && this.state.node.children.length > 0);
    }

    private isNodeActive(): boolean {
        return this.state.activeNode && this.state.activeNode.id === this.state.node.id;
    }

    public hasActiveChild(): boolean {
        return this.state.activeNode &&
            this.state.node.children &&
            this.checkForActiveChild(this.state.node.children);
    }

    private checkForActiveChild(children: TableTreeNode[]): boolean {
        return children && children.length && children.some(
            (c) => c.id === this.state.activeNode.id || this.checkForActiveChild(c.children)
        );
    }

    public toggleNode(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).emit('nodeToggled', this.state.node);
        (this as any).setStateDirty();
    }

    public nodeClicked(): void {
        (this as any).emit('nodeClicked', this.state.node);
    }

    public nodeHovered(): void {
        if (!this.isNodeActive()) {
            (this as any).emit('nodeHovered', this.state.node);
        }
    }

    public childNodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

    public childNodeToggled(node: TreeNode): void {
        (this as any).emit('nodeToggled', node);
    }

    public childNodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

}

module.exports = TreeNodeComponent;
