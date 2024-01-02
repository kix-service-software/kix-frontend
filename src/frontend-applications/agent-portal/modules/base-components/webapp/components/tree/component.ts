/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { TreeUtil, TreeNode } from '../../core/tree';

class TreeComponent {

    private state: ComponentState;

    private setParentFlags: boolean = true;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree;
        this.state.treeId = input.treeId ? 'tree-' + input.treeId : 'tree-' + IdService.generateDateBasedId();
        this.setParentFlags = typeof input.setParentFlags !== 'undefined' ? input.setParentFlags : true;
        if (this.state.filterValue !== input.filterValue) {
            this.state.filterValue = input.filterValue;
            TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue, null, false, this.setParentFlags);
        }
        this.state.activeNode = input.activeNode;
        this.state.treeStyle = input.treeStyle;
    }

    public getNodes(): TreeNode[] {
        return this.state.tree;
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
