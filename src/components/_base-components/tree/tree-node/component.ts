import { TreeNode } from '@kix/core/dist/browser/model';
import { TreeNodeComponentState } from './model/TreeNodeComponentState';

class TreeNodeComponent {

    private state: TreeNodeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeNodeComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
    }

    private hasSubNodes(): boolean {
        return (this.state.node.subNodes && this.state.node.subNodes.length > 0);
    }

    private hasProperties(): boolean {
        return (this.state.node.properties && this.state.node.properties.length > 0);
    }

    private getTitle(): string {
        let title = this.state.node.label;
        if (this.hasProperties()) {
            title += ' (';
            this.state.node.properties.forEach((prop, index) => {
                if (index !== 0) {
                    title += '|';
                }
                title += prop.value;
            });
            title += ')';
        }
        return title;
    }

    private toggleExpand(): void {
        this.state.expanded = !this.state.expanded;
    }

    private SubNodesExpanded(): boolean {
        return (this.hasSubNodes() && this.state.expanded);
    }

    private nodeClicked(id: any, isLeaf: boolean): void {
        (this as any).emit('nodeClicked', id, isLeaf);
    }

}

module.exports = TreeNodeComponent;
