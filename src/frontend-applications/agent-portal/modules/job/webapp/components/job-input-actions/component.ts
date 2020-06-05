/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { IdService } from '../../../../../model/IdService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { JobFormService, JobService } from '../../core';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ServiceType } from '../../../../../modules/base-components/webapp/core/ServiceType';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { JobProperty } from '../../../model/JobProperty';
import { FormInstance } from '../../../../../modules/base-components/webapp/core/FormInstance';
import { SortUtil } from '../../../../../model/SortUtil';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { MacroActionType } from '../../../model/MacroActionType';



class Component extends FormInputComponent<string, ComponentState> {

    private currentAction: TreeNode;
    private listenerId: string;
    private treeId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
        this.listenerId = IdService.generateDateBasedId('job-action-input');
        this.treeId = this.listenerId;
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
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.listenerId,
            updateForm: () => { return; },
            formValueChanged: this.formValueChanged.bind(this)
        });
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.listenerId);
    }

    private async load(): Promise<TreeNode[]> {
        const nodes = await this.getNodes();
        this.setCurrentNode(nodes);
        const nodesWithTranslation: Array<[TreeNode, string]> = [];
        for (const node of nodes) {
            const translatedLabel = await TranslationService.translate(node.label);
            nodesWithTranslation.push([node, translatedLabel]);
        }
        return nodesWithTranslation.sort((a, b) => {
            return SortUtil.compareString(a[1], b[1]);
        }).map((nwt) => nwt[0]);

    }

    public setCurrentNode(nodes: TreeNode[]): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            let currentNode;
            if (Array.isArray(this.state.defaultValue.value)) {
                currentNode = nodes.find(
                    (eventNode) => eventNode.id === this.state.defaultValue.value[0]
                );
            } else {
                currentNode = nodes.find(
                    (eventNode) => eventNode.id === this.state.defaultValue.value
                );
            }

            if (currentNode) {
                currentNode.selected = true;
                // instanceId needed to distinguish between values of fields with same action type
                super.provideValue(`${this.state.field.instanceId}###${currentNode.id}`, true);

                this.currentAction = currentNode;
                this.setFieldHint();
                this.setFields(false);

            }
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.currentAction = nodes && nodes.length ? nodes[0] : null;
        // instanceId needed to distinguish between values of fields with same action type
        super.provideValue(this.currentAction ? `${this.state.field.instanceId}###${this.currentAction.id}` : null);

        this.setFieldHint();

        this.setFields();
    }

    private async setFieldHint(): Promise<void> {
        if (this.currentAction) {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            if (formInstance) {
                const jobType = await formInstance.getFormFieldValueByProperty(JobProperty.TYPE);
                if (jobType && jobType.value) {
                    const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                        KIXObjectType.MACRO_ACTION_TYPE, [this.currentAction.id], null, { id: jobType.value }, true
                    ).catch((error): MacroActionType[] => []);
                    if (macroActionTypes && !!macroActionTypes.length) {
                        const type = macroActionTypes.find((t) => t.Name === this.currentAction.id);
                        if (type) {
                            this.state.field.hint = type.Description;
                        }
                    }
                }
            }
        } else {
            this.state.field.hint = this.state.field.defaultHint;
        }
    }


    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async setFields(clear: boolean = true): Promise<void> {
        if (!this.state.field.children || !!!this.state.field.children.length || clear) {
            const formService = ServiceRegistry.getServiceInstance<JobFormService>(
                KIXObjectType.JOB, ServiceType.FORM
            );
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

            if (formService && formInstance) {
                if (this.currentAction) {

                    const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);

                    const childFields = await formService.getFormFieldsForAction(
                        this.currentAction.id, this.state.field.instanceId,
                        typeValue ? typeValue.value : null
                    );
                    formInstance.addNewFormField(this.state.field, childFields, true);
                } else {
                    formInstance.addNewFormField(this.state.field, [], true);
                }
            }
        }
    }

    protected async formValueChanged(formField: FormFieldConfiguration): Promise<void> {
        if (formField.property === JobProperty.MACRO_ACTIONS && formField.instanceId !== this.state.field.instanceId) {
            const treeHandler = TreeService.getInstance().getTreeHandler(this.treeId);
            if (treeHandler) {
                const nodes = await this.getNodes();
                treeHandler.setTree(nodes, undefined, true);
            }
        }
    }

    private async getNodes(unique: boolean = false): Promise<TreeNode[]> {
        const formInstance = await FormService.getInstance().getFormInstance<FormInstance>(this.state.formId);

        const typeValue = await formInstance.getFormFieldValueByProperty(JobProperty.TYPE);
        const type = typeValue ? typeValue.value : null;
        let nodes = await JobService.getInstance().getTreeNodes(
            JobProperty.MACRO_ACTIONS, null, null, null, null, { id: type }
        );

        if (unique && formInstance) {
            const fields = await formInstance.getFields(this.state.field);
            if (fields && fields.length > 1) {
                const values: string[] = [];
                fields.forEach((f) => {
                    if (f.instanceId !== this.state.field.instanceId) {
                        const value = formInstance.getFormFieldValue<string>(f.instanceId);
                        if (value && value.value) {
                            values.push(value.value);
                        }
                    }
                });
                if (nodes) {
                    nodes = nodes.filter((n) => !values.some((v) => v === n.id));
                }
            }
        }
        return nodes;
    }
}

module.exports = Component;
