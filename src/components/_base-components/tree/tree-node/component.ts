import { TreeNodeComponentState } from './TreeNodeComponentState';
import { TreeNode, ObjectIcon } from '@kix/core/dist/model';
import { TreeUtil } from '../TreeUtil';

class TreeNodeComponent {

    private state: TreeNodeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeNodeComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
        this.state.filterValue = input.filterValue;
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

    private canShow(node: TreeNode): boolean {
        return TreeUtil.isNodeVisible(node, this.state.filterValue);
    }

    private isExpanded(): boolean {
        return this.state.node.expanded ||
            (this.state.filterValue !== null && this.state.filterValue !== undefined && this.state.filterValue !== '');
    }

    private toggleNode(): void {
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).setStateDirty();
    }

    private nodeClicked(): void {
        (this as any).emit('nodeClicked', this.state.node);
    }

    private nodeHovered(): void {
        (this as any).emit('nodeHovered', this.state.node);
    }

    private childNodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

    private childNodeToggled(node: TreeNode): void {
        (this as any).emit('nodeToggled', node);
    }

    private childNodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

}

module.exports = TreeNodeComponent;
