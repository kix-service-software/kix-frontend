/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TreeService, TreeNode } from '../../core/tree';
import { IdService } from '../../../../../model/IdService';

class TreeComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.treeId = input.treeId;
    }

    public onInput(input: any): void {
        this.state.tabIndex = typeof input.tabIndex !== 'undefined' ? input.tabIndex : 0;
        this.update(input);
    }

    public onMount(): void {
        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.registerListener(
                IdService.generateDateBasedId(this.state.treeId),
                (nodes: TreeNode[]) => {
                    this.state.nodes = treeHandler.getTree();
                }
            );

            this.state.nodes = treeHandler.getTree();
        }
    }

    private async update(input: any): Promise<void> {
        this.state.treeStyle = input.treeStyle;
    }

}

module.exports = TreeComponent;
