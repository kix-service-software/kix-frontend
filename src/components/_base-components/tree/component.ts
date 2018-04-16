import { TreeComponentState } from './TreeComponentState';
import { TreeNode } from '@kix/core/dist/model';

class TreeComponent {

    private state: TreeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree || [];
    }

    private nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

}

module.exports = TreeComponent;
