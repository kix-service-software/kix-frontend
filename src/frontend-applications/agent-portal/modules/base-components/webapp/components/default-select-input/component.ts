/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CompontentState } from './CompontentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { DefaultSelectInputFormOption } from '../../../../../model/configuration/DefaultSelectInputFormOption';
import { TreeNode, TreeService } from '../../core/tree';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormInstance } from '../../../../../modules/base-components/webapp/core/FormInstance';

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

        if (this.state.field && this.state.field.options && !!this.state.field.options) {
            const asMultiselectOption = this.state.field.options.find(
                (o) => o.option === DefaultSelectInputFormOption.MULTI
            );
            this.state.asMultiselect = asMultiselectOption && typeof asMultiselectOption.value === 'boolean'
                ? asMultiselectOption.value : false;
        }
        this.state.prepared = true;
    }

    public async load(): Promise<TreeNode[]> {
        let nodes = [];
        if (this.state.field && this.state.field.options && !!this.state.field.options) {
            const nodesOption = this.state.field.options.find(
                (o) => o.option === DefaultSelectInputFormOption.NODES
            );
            nodes = nodesOption ? (nodesOption.value as TreeNode[]).map(
                (n) => new TreeNode(
                    n.id, n.label, n.icon, n.secondaryIcon, n.children, n.parent, n.nextNode, n.previousNode,
                    n.properties, n.expanded, n.visible, n.expandOnClick, n.selectable, n.tooltip, n.flags,
                    n.navigationNode, n.selected
                )
            ) : [];

            if (this.state.field.countMax && this.state.field.countMax > 1) {
                const uniqueOption = this.state.field.options.find(
                    (o) => o.option === DefaultSelectInputFormOption.UNIQUE
                );
                const unique = uniqueOption && typeof uniqueOption.value === 'boolean' ? uniqueOption.value : true;
                if (unique) {
                    nodes = await this.handleUnique(nodes);
                }
            }
        }

        await this.setCurrentNode(nodes);
        return nodes;
    }

    public async setCurrentNode(nodes: TreeNode[]): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const defaultValue = formInstance.getFormFieldValue<string | number | string[] | number[]>(
            this.state.field.instanceId
        );
        if (defaultValue && defaultValue.value !== null) {
            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            let selectedNodes = [];
            if (treeHandler) {
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
                treeHandler.setSelection(selectedNodes, true, false, true);
            }
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        const selectedNodes = nodes && nodes.length ? nodes : null;
        super.provideValue(selectedNodes && !!selectedNodes.length ? selectedNodes.map((sn) => sn.id) : null);
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async handleUnique(nodes: TreeNode[]): Promise<TreeNode[]> {
        const formInstance = await FormService.getInstance().getFormInstance<FormInstance>(this.state.formId);
        if (formInstance) {
            const fieldList = await formInstance.getFields(this.state.field);
            let usedValues = [];
            fieldList.forEach((f) => {
                if (f.property === this.state.field.property && f.instanceId !== this.state.field.instanceId) {
                    const fieldValue = formInstance.getFormFieldValue(f.instanceId);
                    if (fieldValue && fieldValue.value !== null) {
                        if (Array.isArray(fieldValue.value)) {
                            usedValues = [...usedValues, ...fieldValue.value];
                        } else {
                            usedValues.push(fieldValue.value);
                        }
                    }
                }
            });
            nodes = nodes.filter((n) => !usedValues.some((v) => v === n.id));
        }
        return nodes;
    }
}

module.exports = Component;
