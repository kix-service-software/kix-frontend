import { ComponentState } from './ComponentState';
import { TreeUtil, TreeNode } from '../../../core/model';
import { IdService } from '../../../core/browser/IdService';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class TreeComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.treeId = input.treeId ? input.treeId : 'tree-' + IdService.generateDateBasedId();
    }

    public async onInput(input: any): Promise<void> {
        for (const n of input.nodes) {
            (n as TreeNode).label = await TranslationService.translate(n.label, []);
        }
        this.state.nodes = input.nodes;
        this.state.filterValue = input.filterValue;
        TreeUtil.linkTreeNodes(this.state.nodes, this.state.filterValue);

        this.state.activeNodes = input.activeNodes;
        (this as any).setStateDirty('activeNodes');
        this.state.treeStyle = input.treeStyle;
    }

    public onMount(): void {
        this.state.treeParent = (this as any).getEl().parentElement;
    }

    public nodeToggled(node: TreeNode): void {
        TreeUtil.linkTreeNodes(this.state.nodes, this.state.filterValue);
        (this as any).emit('nodeToggled', node);
    }

    public nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    public nodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }

    public getFilteredNodes(): any {
        return this.state.nodes.filter((n) => n.visible);
    }
}

module.exports = TreeComponent;
