/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CompontentState } from './CompontentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TreeNode, TreeService, TreeHandler } from '../../core/tree';
import { ContextService } from '../../core/ContextService';

class Component extends FormInputComponent<string, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        const treeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        await this.load();
        await super.onMount();
        this.state.prepared = true;
    }

    private async load(): Promise<void> {
        const languages = await TranslationService.getInstance().getLanguages();
        const nodes = [];
        for (const lang of languages) {
            const language = await TranslationService.translate(lang[1]);
            nodes.push(new TreeNode(lang[0], language));
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes, null, true);
        }
    }

    public async setCurrentValue(): Promise<void> {
        let lang: string;

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        if (value) {
            lang = value.value;
        } else {
            lang = await TranslationService.getUserLanguage();
        }

        if (lang && treeHandler) {
            const nodes = treeHandler.getTree();
            const currentNode = nodes.find((n) => n.id === lang);
            if (currentNode) {
                currentNode.selected = true;
            }

            treeHandler.setSelection([currentNode], true, true, true);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? currentNode.id : null);
    }
}

module.exports = Component;
