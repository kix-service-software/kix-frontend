/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../model/IdService';
import { TreeUtil, TreeNode } from '../../core/tree';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { ContextService } from '../../core/ContextService';
import { BrowserUtil } from '../../core/BrowserUtil';

class TreeComponent {

    private state: ComponentState;

    private setParentFlags: boolean = true;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.tree = input.tree;
        this.state.treeId = input.treeId ? 'tree-' + input.treeId : 'tree-' + IdService.generateDateBasedId();
        this.setParentFlags = typeof input.setParentFlags !== 'undefined'
            ? input.setParentFlags
            : true;

        if (this.state.filterValue !== input.filterValue) {
            this.state.filterValue = input.filterValue;
            TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue, null, false, this.setParentFlags);
        }

        this.state.activeNode = input.activeNode;
        this.state.treeStyle = input.treeStyle;

        this.state.allowExpandCollapseAll = typeof input.allowExpandCollapseAll !== 'undefined'
            ? input.allowExpandCollapseAll
            : true;
    }

    public async onMount(): Promise<void> {
        this.prepareExpandCollapseAll();
        this.prepareUserPreference();
    }

    private async prepareExpandCollapseAll(allowExpandCollapseAll: boolean = true): Promise<void> {
        if (this.state.allowExpandCollapseAll) {
            let expandCollapseAll = false;
            for (const node of this.state.tree) {
                if (TreeUtil.hasChildrenToShow(node, this.state.filterValue)) {
                    expandCollapseAll = true;
                    break;
                }
            }
            this.state.allowExpandCollapseAll = expandCollapseAll;
        }
    }

    private async prepareUserPreference(): Promise<void> {
        if (this.state.allowExpandCollapseAll) {
            const context = ContextService.getInstance().getActiveContext();
            const treeExpanded = await AgentService.getInstance().getUserPreference(`tree-expanded-${context.contextId}-${this.state.treeId}`);
            const hasUserPreferenceSet = treeExpanded !== undefined;

            if (hasUserPreferenceSet) {
                this.expandOrCollapseAll(BrowserUtil.isBooleanTrue(treeExpanded.Value));
            }
        }
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

    public expandOrCollapseAll(expand?: boolean): void {
        TreeUtil.expandOrCollapseAll(this.state.tree, expand);

        const treeElement: HTMLElement = (this as any).getEl('state.treeId');


        const context = ContextService.getInstance().getActiveContext();
        AgentService.getInstance().setPreferences([[`tree-expanded-${context.contextId}-${this.state.treeId}`, expand]]);

        (this as any).setStateDirty('tree');
    }
}

module.exports = TreeComponent;
