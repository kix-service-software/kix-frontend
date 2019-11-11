/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import {
    TreeNode, FormInputComponent, JobProperty, KIXObjectType, TreeService, FormInstance
} from "../../../../../../core/model";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";
import { ServiceRegistry, ServiceType, FormService, IdService } from "../../../../../../core/browser";
import { JobService, JobFormService } from "../../../../../../core/browser/job";
import { FormFieldConfiguration } from "../../../../../../core/model/components/form/configuration";

class Component extends FormInputComponent<string[], ComponentState> {

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
        return nodes;
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
                super.provideValue(currentNode.id, true);
                this.currentAction = currentNode;
                this.setFields();
            }
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.currentAction = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.currentAction ? this.currentAction.id : null);
        this.setFields();
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async setFields(clear?: boolean): Promise<void> {
        const formService = ServiceRegistry.getServiceInstance<JobFormService>(
            KIXObjectType.JOB, ServiceType.FORM
        );
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

        if (formService && formInstance) {
            if (this.currentAction) {
                const childFields = await formService.getFormFieldsForAction(
                    this.currentAction.id, this.state.field.instanceId
                );
                formInstance.addNewFormField(this.state.field, childFields, true);
            } else {
                formInstance.addNewFormField(this.state.field, [], true);
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
        let nodes = await JobService.getInstance().getTreeNodes(
            JobProperty.MACRO_ACTIONS
        );
        const formInstance = await FormService.getInstance().getFormInstance<FormInstance>(this.state.formId);
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
