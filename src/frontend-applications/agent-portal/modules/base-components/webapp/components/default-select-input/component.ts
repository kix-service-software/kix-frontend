/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { EventService } from '../../core/EventService';
import { FormEvent } from '../../core/FormEvent';
import { IEventSubscriber } from '../../core/IEventSubscriber';
import { FormValuesChangedEventData } from '../../core/FormValuesChangedEventData';

class Component extends FormInputComponent<string | number | string[] | number[], CompontentState> {

    private formSubscriber: IEventSubscriber;

    // TODO: move to FormInstance/ValueHandler as universal solution for unique handling (possible values)
    private uniqueNodes: boolean;

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

            if (this.state.field?.countMax && this.state.field?.countMax > 1) {
                const uniqueOption = this.state.field?.options.find(
                    (o) => o.option === DefaultSelectInputFormOption.UNIQUE
                );
                this.uniqueNodes = uniqueOption && typeof uniqueOption.value === 'boolean' ? uniqueOption.value : true;
            }
        }
        const treeHandler = new TreeHandler([], null, null, this.state.asMultiselect);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);

        await this.load();
        await super.onMount();

        if (this.uniqueNodes) {
            this.formSubscriber = {
                eventSubscriberId: this.state.field?.instanceId,
                eventPublished: (data: any, eventId: string): void => {
                    if (
                        this.uniqueNodes && eventId === FormEvent.VALUES_CHANGED &&
                        data && (data as FormValuesChangedEventData).changedValues?.length
                    ) {
                        const samePropertyFieldChanged = (data as FormValuesChangedEventData).changedValues.some(
                            (cV) => cV[0].property === this.state.field?.property
                        );
                        if (samePropertyFieldChanged) {
                            this.load();
                        }
                    }
                }
            };
            EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }

        this.state.prepared = true;
    }

    public async setPossibleValue(): Promise<void> {
        return this.load(true);
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        TreeService.getInstance().removeTreeHandler(this.state.treeId);
        if (this.uniqueNodes) {
            EventService.getInstance().unsubscribe(FormEvent.VALUES_CHANGED, this.formSubscriber);
        }
    }

    public async load(filterSelection?: boolean): Promise<void> {
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

            if (this.uniqueNodes) {
                nodes = await this.handleUnique(nodes);
            }

            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            if (treeHandler) {
                treeHandler.setTree(nodes, null, true, filterSelection);
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
        if (this.state.asMultiselect) {
            super.provideValue(nodes?.map((n) => n.id));
        } else {
            super.provideValue(nodes[0]?.id);
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    // TODO: move to FormInstance/ValueHandler as universal solution for unique handling (possible values)
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
