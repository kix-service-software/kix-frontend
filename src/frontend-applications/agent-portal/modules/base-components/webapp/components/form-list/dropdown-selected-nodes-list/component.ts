/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TreeHandler, TreeService, TreeNode } from '../../../core/tree';
import { IdService } from '../../../../../../model/IdService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private treeHandler: TreeHandler;
    private listenerId: string;
    private treeId: string;

    public onCreate(input: ComponentInput): void {
        this.state = new ComponentState();
        this.listenerId = IdService.generateDateBasedId('dropdown-selected-nodes-list');
        this.treeId = input.treeId;
    }

    public onInput(input: ComponentInput): void {
        this.state.placeholder = input.placeholder;
        if (input.treeId && this.treeId !== input.treeId) {
            this.treeId = input.treeId;
            this.setNodes();
        }
    }

    public async onMount(): Promise<void> {
        this.setNodes();
    }

    private async setNodes(): Promise<void> {
        this.treeHandler = TreeService.getInstance().getTreeHandler(this.treeId);
        this.treeHandler.registerListener(this.listenerId, (nodes: TreeNode[]) => {
            this.state.nodes = this.treeHandler.getSelectedNodes();
        });

        this.state.translations = await TranslationService.createTranslationObject(
            this.treeHandler.getTree().map((n) => n.tooltip)
        );

        this.state.nodes = this.treeHandler.getSelectedNodes();
    }

    public removeNode(node: TreeNode, event: any): void {
        event.stopPropagation();
        event.preventDefault();
        if (this.treeHandler) {
            this.treeHandler.setSelection([node], false, false, true);
            this.state.nodes = this.treeHandler.getSelectedNodes();
        }
    }

    public stopFocus(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

}

module.exports = Component;
