import { ComponentState } from './ComponentState';
import { TreeNode } from '../../../../../../../core/model';

class TreeNodeComponent {

    private state: ComponentState;
    private hasListener: boolean = false;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.node);
    }

    public onInput(input: any): void {
        this.state.node = input.node;
        this.state.filterValue = input.filterValue;
        this.state.activeNodes = input.activeNodes;
        (this as any).setStateDirty('activeNodes');
        this.state.treeId = input.treeId;
        this.state.nodeId = this.state.treeId + '-node-' + this.state.node.id;
        if (!this.hasListener && input.treeParent) {
            this.state.treeParent = input.treeParent;
            this.state.treeParent.addEventListener('keydown', this.navigateTree.bind(this));
            this.hasListener = true;
        }
    }

    public onDestroy(): void {
        this.state.treeParent.removeEventListener('keydown', this.navigateTree);
        this.state.node = null;
        this.state.filterValue = null;
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

    private isNodeActive(): boolean {
        return this.state.activeNodes && this.state.activeNodes.some((n) => n.id === this.state.node.id);
    }

    private toggleNode(event: any): void {
        event.stopPropagation();
        event.preventDefault(event);
        this.state.node.expanded = !this.state.node.expanded;
        (this as any).emit('nodeToggled', this.state.node);
        (this as any).setStateDirty();
    }

    private nodeClicked(): void {
        (this as any).emit('nodeClicked', this.state.node);
    }

    private nodeHovered(): void {
        if (!this.isNodeActive()) {
            (this as any).emit('nodeHovered', this.state.node);
        }
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

    // TODO: Tastatur-Steuerung wieder aktivieren und korrigieren
    private navigateTree(event: any): void {
        // if (this.state.node && this.navigationKeyPressed(event) && this.isNodeActive()) {
        //     if (event.preventDefault) {
        //         event.preventDefault();
        //         event.stopPropagation();
        //     }

        //     switch (event.key) {
        //         case 'ArrowUp':
        //             if (this.state.node.previousNode) {
        //                 this.childNodeHovered(this.state.node.previousNode);
        //             }
        //             break;
        //         case 'ArrowDown':
        //             if (this.state.node.nextNode) {
        //                 this.childNodeHovered(this.state.node.nextNode);
        //             }
        //             break;
        //         case 'ArrowLeft':
        //             this.state.node.expanded = false;
        //             this.childNodeToggled(this.state.node);
        //             (this as any).setStateDirty();
        //             break;
        //         case 'ArrowRight':
        //             if (TreeUtil.hasChildrenToShow(this.state.node, this.state.filterValue)) {
        //                 this.state.node.expanded = true;
        //                 this.childNodeToggled(this.state.node);
        //                 (this as any).setStateDirty();
        //             }
        //             break;
        //         default:
        //     }
        // }
    }

    private navigationKeyPressed(event: any): boolean {
        return event.key === 'ArrowLeft'
            || event.key === 'ArrowRight'
            || event.key === 'ArrowUp'
            || event.key === 'ArrowDown';
    }
}

module.exports = TreeNodeComponent;
