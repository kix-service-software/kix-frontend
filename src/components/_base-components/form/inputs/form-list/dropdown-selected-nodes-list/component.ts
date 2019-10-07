/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, IdService } from '../../../../../../core/browser';
import { TranslationService } from '../../../../../../core/browser/i18n/TranslationService';
import { TreeHandler, TreeNode, TreeService } from '../../../../../../core/model';
import { ComponentInput } from './ComponentInput';

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
    }

    public async onMount(): Promise<void> {
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
            this.treeHandler.setSelection([node], false);
            this.state.nodes = this.treeHandler.getSelectedNodes();
        }
    }

    public stopFocus(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

}

module.exports = Component;
