import { TreeNode } from './model/TreeNode';
import { TreeNodeComponentState } from './model/TreeNodeComponentState';

class TreeNodeComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = new TreeNodeComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
    }

    private hasSubNodes(): boolean {
        return (this.state.node.subNodes && this.state.node.subNodes.length > 0);
    }

    private toggleExpand(): void {
        this.state.expanded = !this.state.expanded;
    }

    private nodeClicked(id: any): void {
        (this as any).emit('elementClicked', id);
    }

}

module.exports = TreeNodeComponent;
