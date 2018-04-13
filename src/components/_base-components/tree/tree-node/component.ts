import { TreeNodeComponentState } from './TreeNodeComponentState';
import { TreeNode } from '@kix/core/dist/model';

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

    private hasProperties(): boolean {
        return (this.state.node.properties && this.state.node.properties.length > 0);
    }

    private getTitle(): string {
        let title = this.state.node.label;
        if (this.hasProperties()) {
            const values = this.state.node.properties.map((prop) => prop.value);
            title += ' (' + values.join('|') + ')';
        }
        return title;
    }

    private toggleExpand(): void {
        this.state.expanded = !this.state.expanded;
    }

    private ChildsExpanded(): boolean {
        return (this.hasChildren() && this.state.expanded);
    }

    private nodeClicked(node: TreeNode, isLeaf: boolean): void {
        (this as any).emit('nodeClicked', node);
    }

}

module.exports = TreeNodeComponent;
