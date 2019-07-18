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

class Component extends FormInputComponent<string | number | string[] | number[], CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
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
        this.prepareList();
        this.setCurrentNode();
    }

    private prepareList(): void {
        if (this.state.field && this.state.field.options && !!this.state.field.options) {
            const nodesOption = this.state.field.options.find(
                (o) => o.option === DefaultSelectInputFormOption.NODES
            );
            this.state.nodes = nodesOption ? nodesOption.value : [];

            const asMultiselectOption = this.state.field.options.find(
                (o) => o.option === DefaultSelectInputFormOption.MULTI
            );
            this.state.asMultiselect = asMultiselectOption && typeof asMultiselectOption.value === 'boolean'
                ? asMultiselectOption.value : false;
        }
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            if (Array.isArray(this.state.defaultValue.value)) {
                this.state.selectedNodes = this.state.nodes.filter(
                    (n) => (this.state.defaultValue.value as Array<string | number>).some((dv) => dv === n.id)
                );
            } else {
                const node = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
                this.state.selectedNodes = node ? [node] : [];
            }
            super.provideValue(
                this.state.selectedNodes && !!this.state.selectedNodes.length
                    ? this.state.selectedNodes.map((sn) => sn.id) : null);
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        this.state.selectedNodes = nodes && nodes.length ? nodes : null;
        super.provideValue(
            this.state.selectedNodes && !!this.state.selectedNodes.length
                ? this.state.selectedNodes.map((sn) => sn.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
