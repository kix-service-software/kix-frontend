/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeNode, TableTreeNode, TableTreeNodeLabel } from '../../../core/model';
import { IdService } from '../../../core/browser/IdService';

class TreeComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree;
        this.state.filterValue = input.filterValue;
        this.state.treeId = input.treeId ? 'tree-' + input.treeId : 'tree-' + IdService.generateDateBasedId();
        this.state.activeNode = input.activeNode;
        this.state.treeStyle = input.treeStyle;
        if (input.titles) {
            this.state.titleNode = new TableTreeNode('title', input.titles.map((t) => new TableTreeNodeLabel(t)));
        }
    }

    public onMount(): void {
        this.state.treeParent = (this as any).getEl().parentElement;
    }

    public nodeToggled(node: TreeNode): void {
        (this as any).emit('nodeToggled', node);
    }

    public nodeClicked(node: TreeNode): void {
        (this as any).emit('nodeClicked', node);
    }

    public nodeHovered(node: TreeNode): void {
        (this as any).emit('nodeHovered', node);
    }
}

module.exports = TreeComponent;
