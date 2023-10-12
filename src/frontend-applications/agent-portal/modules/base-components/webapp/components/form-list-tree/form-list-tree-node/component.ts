/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentInput } from './ComponentInput';
import { ComponentState } from './ComponentState';
import { TreeHandler, TreeService, TreeNode } from '../../../core/tree';
import { IdService } from '../../../../../../model/IdService';
import { BrowserUtil } from '../../../../../../modules/base-components/webapp/core/BrowserUtil';

class TreeNodeComponent {

    private state: ComponentState;
    private treeId: string;
    private treeHandler: TreeHandler;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.node);
    }

    public onInput(input: ComponentInput): void {
        this.state.node = input.node;
        this.treeId = input.treeId;
    }

    public onMount(): void {
        this.state.nodeId = this.treeId + '-node-' + this.state.node.id;
        this.treeHandler = TreeService.getInstance().getTreeHandler(this.treeId);
        this.treeHandler.registerListener(
            IdService.generateDateBasedId('tree-node'), (nodes: TreeNode[]) => (this as any).setStateDirty()
        );
    }

    public onUpdate(): void {
        const element = (this as any).getEl(this.state.nodeId);
        if (element && this.state.node.navigationNode) {
            BrowserUtil.scrollIntoViewIfNeeded(element);
        }
    }

    public onDestroy(): void {
        this.state.node = null;
    }

    public hasChildren(): boolean {
        return (this.state.node.children && this.state.node.children.length > 0);
    }

    public getLabel(): string {
        let title = this.state.node.label;
        if (this.state.node.properties) {
            const values = this.state.node.properties.map((prop) => prop.value);
            title += ' (' + values.join('|') + ')';
        }
        return title;
    }

    public nodeClicked(): void {
        if (this.treeHandler && this.state.node.selectable) {
            this.treeHandler.setSelection([this.state.node], !this.state.node.selected);
        }
    }

    public toggleNode(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        if (this.treeHandler) {
            this.treeHandler.toggleNode(this.state.node);
        }
    }

    public getToolTip(): string {
        return this.state.node.tooltip;
    }

}

module.exports = TreeNodeComponent;
