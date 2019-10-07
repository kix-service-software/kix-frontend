/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent, TreeNode, DefaultSelectInputFormOption } from '../../../../../core/model';
import { CompontentState } from './CompontentState';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';
import { FormService } from '../../../../../core/browser';

class Component extends FormInputComponent<string | number | string[] | number[], CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async load(): Promise<TreeNode[]> {
        let nodes = [];
        if (this.state.field && this.state.field.options && !!this.state.field.options) {
            const nodesOption = this.state.field.options.find(
                (o) => o.option === DefaultSelectInputFormOption.NODES
            );
            nodes = nodesOption ? nodesOption.value : [];

            const asMultiselectOption = this.state.field.options.find(
                (o) => o.option === DefaultSelectInputFormOption.MULTI
            );
            this.state.asMultiselect = asMultiselectOption && typeof asMultiselectOption.value === 'boolean'
                ? asMultiselectOption.value : false;
        }

        await this.setCurrentNode(nodes);
        return nodes;
    }

    public async setCurrentNode(nodes: TreeNode[]): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const defaultValue = formInstance.getFormFieldValue<string | number | string[] | number[]>(
            this.state.field.instanceId
        );
        if (defaultValue && defaultValue.value) {
            let selectedNodes = [];
            if (Array.isArray(defaultValue.value)) {
                selectedNodes = nodes.filter(
                    (n) => (defaultValue.value as Array<string | number>).some((dv) => dv === n.id)
                );
                selectedNodes.forEach((n) => n.selected = true);
            } else {
                const node = nodes.find((n) => n.id === defaultValue.value);
                if (node) {
                    node.selected = true;
                    selectedNodes = [node];
                }
            }
            super.provideValue(selectedNodes && !!selectedNodes.length ? selectedNodes.map((sn) => sn.id) : null);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        const selectedNodes = nodes && nodes.length ? nodes : null;
        super.provideValue(selectedNodes && !!selectedNodes.length ? selectedNodes.map((sn) => sn.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
