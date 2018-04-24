import { TreeComponentState } from './TreeComponentState';
import { TreeNode } from '@kix/core/dist/model';
import { TreeUtil } from './TreeUtil';

class TreeComponent {

    private state: TreeComponentState;

    public onCreate(input: any): void {
        this.state = new TreeComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree;
        this.state.filterValue = input.filterValue;
        document.addEventListener('keydown', this.navigateTree.bind(this));
        this.state.activeNode = input.activeNode;
    }

    public onMount(): void {
        console.log('Mount Tree');
    }

    public onDestroy(): void {
        console.log("Destroy Tree");
        document.removeEventListener('keydown', this.navigateTree);
    }

    private nodeToggled(node: TreeNode): void {
        (this as any).emit('nodeToggled', node);
    }

    private nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    private navigateTree(event: any): void {
        if (this.navigationKeyPressed(event)) {
            switch (event.key) {
                case 'Enter':
                    this.nodeClicked(this.state.activeNode);
                    break;
                case 'Escape':
                    this.nodeClicked(null);
                    break;
                case 'ArrowLeft':
                    this.state.activeNode.expanded = false;
                    break;
                case 'ArrowUp':
                    this.state.activeNode = TreeUtil.navigateUp(this.state.activeNode, this.state.tree);
                    break;
                case 'ArrowRight':
                    this.state.activeNode.expanded = true;
                    break;
                case 'ArrowDown':
                    this.state.activeNode = TreeUtil.navigateDown(this.state.activeNode, this.state.tree);
                    break;
                default:
            }
        }
    }

    private navigationKeyPressed(event: any): boolean {
        return event.key === 'ArrowUp' ||
            event.key === 'ArrowDown' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowRight' ||
            event.key === 'Escape' ||
            event.key === 'Enter';
    }

    private nodeHovered(node: TreeNode): void {
        if (this.state.activeNode) {
            this.state.activeNode.active = false;
        }
        this.state.activeNode = node;
        this.state.activeNode.active = true;
        (this as any).emit('nodeHovered', TreeUtil.findNode(node, this.state.tree));
    }

    private canShow(node: TreeNode): boolean {
        return TreeUtil.isNodeVisible(node, this.state.filterValue);
    }

}

module.exports = TreeComponent;
