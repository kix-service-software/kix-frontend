import { TreeComponentState } from './TreeComponentState';
import { TreeNode } from '@kix/core/dist/model';
import { TreeUtil } from './TreeUtil';

class TreeComponent {

    private state: TreeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeComponentState();
    }

    public onInput(input: any): void {
        this.state.subTree = typeof input.subTree !== 'undefined' ? input.subTree : false;
        if (this.state.subTree) {
            this.state.displayTree = input.tree;
        } else {
            this.state.tree = TreeUtil.cloneTree(null, input.tree, this.state.activeNode);
            this.initTree(false, null, false);
            if (input.filterInputId) {
                const filterElement = document.getElementById(input.filterInputId);
                if (filterElement) {
                    filterElement.addEventListener('keyup', this.filterValueChanged.bind(this));
                    filterElement.addEventListener('keydown', this.navigateTree.bind(this));
                }
            }
            this.state.activeNode = null;
        }
    }

    private initTree(expandNodes: boolean = false, activeNode?: TreeNode, useCurrentTree: boolean = true): void {
        const newTree = TreeUtil.cloneTree(
            null,
            useCurrentTree ? this.state.displayTree : this.state.tree,
            this.state.activeNode
        );

        const tree = TreeUtil.buildTree(newTree, this.state.filterValue, expandNodes);
        this.state.displayTree = tree;
    }

    private nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    private filterValueChanged(event: any): void {
        if (!this.navigationKeyPressed(event)) {
            this.state.filterValue = event.target.value;
            this.initTree(this.state.filterValue && this.state.filterValue !== '', null, false);
        }
    }

    private navigateTree(event: any): void {
        if (this.navigationKeyPressed(event)) {
            switch (event.keyCode) {
                case 13: // Enter
                    this.nodeClicked(this.state.activeNode);
                    break;
                case 27: // Escape
                    this.nodeClicked(null);
                    break;
                case 37: // Left
                    this.state.activeNode.expanded = false;
                    break;
                case 38: // Up
                    this.state.activeNode = TreeUtil.navigateUp(this.state.activeNode, this.state.displayTree);
                    break;
                case 39: // Right
                    this.state.activeNode.expanded = true;
                    break;
                case 40: // Down
                    this.state.activeNode = TreeUtil.navigateDown(this.state.activeNode, this.state.displayTree);
                    break;
                default:
            }
            this.state.displayTree = TreeUtil.cloneTree(null, this.state.displayTree, this.state.activeNode);
            this.state.activeNode = TreeUtil.findNode(this.state.activeNode, this.state.displayTree);
        }
    }

    private navigationKeyPressed(event: any): boolean {
        return event.keyCode === 13
            || event.keyCode === 27
            || event.keyCode === 37
            || event.keyCode === 38
            || event.keyCode === 39
            || event.keyCode === 40;
    }

    private nodeHovered(node: TreeNode): void {
        if (this.state.subTree) {
            (this as any).emit('nodeHovered', node);
        } else {
            if (this.state.activeNode) {
                this.state.activeNode.active = false;
            }
            this.state.activeNode = node;
            this.state.activeNode.active = true;
            this.state.displayTree = TreeUtil.cloneTree(null, this.state.displayTree, this.state.activeNode);
        }
    }

}

module.exports = TreeComponent;
