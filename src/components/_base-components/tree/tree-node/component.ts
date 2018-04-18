import { TreeNodeComponentState } from './TreeNodeComponentState';
import { TreeNode, ObjectIcon } from '@kix/core/dist/model';

class TreeNodeComponent {

    private state: TreeNodeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeNodeComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
    }

    private hasChildren(): boolean {
        return (this.state.node.children && this.state.node.children.length > 0);
    }

    private getLabel(): string {
        let title = this.state.node.label;
        if (this.state.node.properties) {
            const values = this.state.node.properties.map((prop) => prop.value);
            title += ' (' + values.join('|') + ')';
        }
        return title;
    }

    private toggleNode(): void {
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).setStateDirty();
    }

    private nodeClicked(): void {
        (this as any).emit('nodeClicked', this.state.node);
    }

    private treeNodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    private nodeHovered(): void {
        (this as any).emit('nodeHovered', this.state.node);
    }

    private treeNodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

}

module.exports = TreeNodeComponent;
