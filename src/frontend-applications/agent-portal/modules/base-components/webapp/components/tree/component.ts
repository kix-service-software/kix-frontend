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
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { BrowserUtil } from '../../core/BrowserUtil';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';

class TreeComponent extends AbstractMarkoComponent<ComponentState> {

    private setParentFlags: boolean = true;
    private allowExpandCollapseAll: boolean;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.tree = input.tree;
        this.state.treeId = input.treeId ? input.treeId : 'tree-' + IdService.generateDateBasedId();
        this.setParentFlags = typeof input.setParentFlags !== 'undefined'
            ? input.setParentFlags
            : true;

        if (this.state.filterValue !== input.filterValue) {
            this.state.filterValue = input.filterValue;
            TreeUtil.linkTreeNodes(this.state.tree, this.state.filterValue, null, false, this.setParentFlags);
        }

        this.state.activeNode = input.activeNode;
        this.state.treeStyle = input.treeStyle;

        if (this.allowExpandCollapseAll === undefined) {
            this.allowExpandCollapseAll = typeof input.allowExpandCollapseAll !== 'undefined'
                ? input.allowExpandCollapseAll
                : true;

            this.state.allowExpandCollapseAll = this.allowExpandCollapseAll;
        }

        this.prepareExpandCollapseAll();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Expand All', 'Translatable#Collapse All'
        ]);
        this.prepareUserPreference();
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    private async prepareExpandCollapseAll(): Promise<void> {
        if (this.allowExpandCollapseAll) {
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
        if (this.allowExpandCollapseAll) {
            const treeExpanded = await AgentService.getInstance().getUserPreference(`tree-expanded-${this.context?.contextId}-${this.state.treeId}`);
            const hasUserPreferenceSet = treeExpanded !== undefined;

            if (hasUserPreferenceSet) {
                this.expandOrCollapseAll(BrowserUtil.isBooleanTrue(treeExpanded.Value), false);
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

    public expandOrCollapseAll(expand: boolean, save: boolean): void {
        TreeUtil.expandOrCollapseAll(this.state.tree, expand);

        if (save) {
            AgentService.getInstance().setPreferences(
                [[`tree-expanded-${this.context.contextId}-${this.state.treeId}`, expand]]
            );
        }

        (this as any).setStateDirty('tree');
    }
}

module.exports = TreeComponent;
