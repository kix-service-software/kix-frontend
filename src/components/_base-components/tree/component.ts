import { TreeComponentState } from './model/TreeComponentState';

class TreeComponent {

    private state: TreeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree || [];
    }

    private nodeClicked(id: any, isLeaf: boolean = false): void {
        (this as any).emit('nodeClicked', id, isLeaf);
    }

}

module.exports = TreeComponent;
