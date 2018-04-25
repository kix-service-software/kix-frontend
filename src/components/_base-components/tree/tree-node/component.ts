import { TreeNodeComponentState } from './TreeNodeComponentState';
import { TreeNode, ObjectIcon } from '@kix/core/dist/model';
import { TreeUtil } from '../TreeUtil';

class TreeNodeComponent {

    private state: TreeNodeComponentState;
    private hasListener: boolean = false;

    public onCreate(input: any): void {
        this.state = new TreeNodeComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
        this.state.filterValue = input.filterValue;
        this.state.activeNode = input.activeNode;
        if (!this.hasListener && input.treeParent) {
            this.state.treeParent = input.treeParent;
            this.state.treeParent.addEventListener('keydown', this.navigateTree.bind(this));
            this.hasListener = true;
        }
    }

    public onDestroy(): void {
        this.state.treeParent.removeEventListener('keydown', this.navigateTree);
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

    private isExpanded(): boolean {
        return this.state.node.expanded ||
            (this.state.filterValue !== null && this.state.filterValue !== undefined && this.state.filterValue !== '');
    }

    private isActiveNode(): boolean {
        return this.state.activeNode && (this.state.activeNode.id === this.state.node.id);
    }

    private toggleNode(): void {
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).emit('nodeToggled', this.state.node);
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

    private navigateTree(event: any): void {
        if (this.navigationKeyPressed(event) && this.isActiveNode()) {
            if (event.preventDefault) {
                event.preventDefault();
            }

            switch (event.key) {
                case 'Tab':
                case 'Enter':
                    this.childNodeClicked(this.state.node);
                    break;
                case 'Escape':
                    this.childNodeClicked(null);
                    break;
                case 'ArrowUp':
                    if (this.state.node.previousNode) {
                        this.childNodeHovered(this.state.node.previousNode);
                    }
                    break;
                case 'ArrowDown':
                    if (this.state.node.nextNode) {
                        this.childNodeHovered(this.state.node.nextNode);
                    }
                    break;
                case 'ArrowLeft':
                    this.state.node.expanded = false;
                    this.childNodeToggled(this.state.node);
                    (this as any).setStateDirty();
                    break;
                case 'ArrowRight':
                    this.state.node.expanded = true;
                    this.childNodeToggled(this.state.node);
                    (this as any).setStateDirty();
                    break;
                default:
            }
        }
    }

    private navigationKeyPressed(event: any): boolean {
        return event.key === 'ArrowLeft'
            || event.key === 'ArrowRight'
            || event.key === 'ArrowUp'
            || event.key === 'ArrowDown'
            || event.key === 'Escape'
            || event.key === 'Enter';
    }
}

module.exports = TreeNodeComponent;
