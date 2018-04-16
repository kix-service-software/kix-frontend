import { TreeComponentState } from './TreeComponentState';
import { TreeNode } from '@kix/core/dist/model';

class TreeComponent {

    private state: TreeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = this.cloneTree(input.tree);
        this.state.filterValue = input.filterValue;
        this.state.displayTree = this.buildTree([...this.state.tree]);
    }

    private cloneTree(tree: TreeNode[]): TreeNode[] {
        const newTree = [];

        for (const node of tree) {
            const newNode = new TreeNode(
                node.id, node.label, node.icon, this.cloneTree(node.children), node.properties
            );
            newTree.push(newNode);
        }
        return newTree;
    }

    private nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    private buildTree(nodes: TreeNode[]): TreeNode[] {
        const displayTree = [];

        if (nodes) {
            for (const node of nodes) {
                node.children = this.buildTree([...node.children]);
                if (node.children.length || this.checkNodeLabel(node.label)) {
                    displayTree.push(node);
                }
            }
        }

        return displayTree;
    }

    private checkNodeLabel(label: string): boolean {
        let match = true;

        if (this.state.filterValue && this.state.filterValue !== '') {
            match = label.toLocaleLowerCase().indexOf(this.state.filterValue.toLocaleLowerCase()) !== -1;
        }

        return match;
    }

}

module.exports = TreeComponent;
