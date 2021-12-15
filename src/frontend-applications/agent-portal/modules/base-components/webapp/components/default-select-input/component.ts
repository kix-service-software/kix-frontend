/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { TreeNode, TreeService, TreeHandler } from '../../core/tree';
import { ContextService } from '../../core/ContextService';

class Component extends FormInputComponent<string | number | string[] | number[], CompontentState> {

    public onCreate(): void {
        this.state = new CompontentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.freeText = typeof input.freeText !== 'undefined' ? input.freeText : false;
        this.update();
    }

    private async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';
        this.state.placeholder = await TranslationService.translate(placeholderText);
        (this as any).setStateDirty('field');
    }

    public async onMount(): Promise<void> {
        if (this.state.field && this.state.field?.options && !!this.state.field?.options) {
            const asMultiselectOption = this.state.field?.options.find(
                (o) => o.option === DefaultSelectInputFormOption.MULTI
            );
            this.state.asMultiselect = typeof asMultiselectOption?.value === 'boolean'
                ? asMultiselectOption.value
                : false;
        }
        const treeHandler = new TreeHandler([], null, null, this.state.asMultiselect);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        await this.load();
        await super.onMount();
        this.state.prepared = true;
    }

    public async load(): Promise<void> {
        let nodes = [];
        if (this.state.field && this.state.field?.options && !!this.state.field?.options) {
            const translatableOption = this.state.field?.options.find(
                (o) => o.option === DefaultSelectInputFormOption.TRANSLATABLE
            );
            const translatable = !translatableOption || Boolean(translatableOption.value);
            const nodesOption = this.state.field?.options.find(
                (o) => o.option === DefaultSelectInputFormOption.NODES
            );
            nodes = await this.getNodes(nodesOption ? nodesOption.value : [], translatable);

            if (this.state.field?.countMax && this.state.field?.countMax > 1) {
                const uniqueOption = this.state.field?.options.find(
                    (o) => o.option === DefaultSelectInputFormOption.UNIQUE
                );
                const unique = uniqueOption && typeof uniqueOption.value === 'boolean' ? uniqueOption.value : true;
                if (unique) {
                    nodes = await this.handleUnique(nodes);
                }
            }

            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            if (treeHandler) {
                treeHandler.setTree(nodes, null, true);
            }
        }
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<string | number | string[] | number[]>(
            this.state.field?.instanceId
        );
        if (value && value.value !== null && typeof value.value !== 'undefined') {
            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            if (treeHandler) {
                let selectedNodes = [];
                const nodes = treeHandler.getTree();
                if (Array.isArray(value.value)) {
                    selectedNodes = nodes.filter(
                        (n) => (value.value as Array<string | number>).some(
                            (dv) => dv?.toString() === n.id.toString()
                        )
                    );
                    selectedNodes.forEach((n) => n.selected = true);
                } else {
                    const node = nodes.find((n) => n.id.toString() === value.value.toString());
                    if (node) {
                        node.selected = true;
                        selectedNodes = [node];
                    }
                }
                treeHandler.setSelection(selectedNodes, true, true, true);
            }
        }
    }

    public valueChanged(nodes: TreeNode[]): void {
        const selectedNodes = nodes && nodes.length ? nodes : null;
        super.provideValue(selectedNodes?.map((sn) => sn.id));
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async handleUnique(nodes: TreeNode[]): Promise<TreeNode[]> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        if (formInstance) {
            const fieldList = await formInstance.getFields(this.state.field);
            let usedValues = [];
            fieldList.forEach((f) => {
                if (f.property === this.state.field?.property && f.instanceId !== this.state.field?.instanceId) {
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

    private async getNodes(nodes: TreeNode[], translatable: boolean = true): Promise<TreeNode[]> {
        const newNodes = [];
        for (const node of nodes) {
            const label = translatable
                ? await TranslationService.translate(node.label)
                : await TranslationService.translate(node.label, null, undefined, true);

            const tooltip = translatable
                ? await TranslationService.translate(node.tooltip)
                : await TranslationService.translate(node.tooltip, null, undefined, true);

            newNodes.push(
                new TreeNode(
                    node.id, label, node.icon, node.secondaryIcon, node.children, node.parent, node.nextNode,
                    node.previousNode, node.properties, node.expanded, node.visible, node.expandOnClick,
                    node.selectable, tooltip, node.flags, node.navigationNode, node.selected
                )
            );
        }
        return newNodes;
    }
}

module.exports = Component;
