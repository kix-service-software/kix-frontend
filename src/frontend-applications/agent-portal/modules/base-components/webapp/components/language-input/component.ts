/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CompontentState } from './CompontentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TreeNode } from '../../core/tree';

class Component extends FormInputComponent<string, CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.prepared = true;
    }

    private async load(): Promise<TreeNode[]> {
        const languages = await TranslationService.getInstance().getLanguages();
        const nodes = languages.map((l) => new TreeNode(l[0], l[1]));
        await this.setCurrentNode(nodes);
        return nodes;
    }

    public async setCurrentNode(nodes: TreeNode[]): Promise<void> {
        let lang: string;
        if (this.state.defaultValue && this.state.defaultValue.value) {
            lang = this.state.defaultValue.value;
        } else {
            lang = await TranslationService.getUserLanguage();
        }

        if (lang) {
            const currentNode = nodes.find((n) => n.id === lang);
            if (currentNode) {
                currentNode.selected = true;
                super.provideValue(currentNode.id);
            }
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? currentNode.id : null);
    }
}

module.exports = Component;
