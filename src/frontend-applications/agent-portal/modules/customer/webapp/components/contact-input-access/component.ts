/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { ServiceRegistry } from '../../../../base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ServiceType } from '../../../../base-components/webapp/core/ServiceType';
import { SortUtil } from '../../../../../model/SortUtil';
import { ContactFormService } from '../../core';
import { UserProperty } from '../../../../user/model/UserProperty';

class Component extends FormInputComponent<string[], ComponentState> {

    private currentAccesses: TreeNode[];

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field.placeholder
            ? this.state.field.placeholder
            : this.state.field.required ? this.state.field.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    private async load(): Promise<TreeNode[]> {
        const nodes = await this.getNodes();
        this.setCurrentNode(nodes);
        return nodes.sort((a, b) => {
            return SortUtil.compareString(a[1], b[1]);
        });
    }

    public async setCurrentValue(): Promise<void> {
        return;
    }

    private async setCurrentNode(nodes: TreeNode[]): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const value = formInstance.getFormFieldValue<number[] | number>(this.state.field.instanceId);
        if (value) {
            let currentNodes: TreeNode[];
            if (Array.isArray(value.value)) {
                currentNodes = nodes.filter(
                    (eventNode) => (value.value as number[]).some((v) => v === eventNode.id)
                );
            } else {
                currentNodes = nodes.filter(
                    (eventNode) => eventNode.id === value.value
                );
            }

            if (currentNodes) {
                currentNodes.forEach((n) => n.selected = true);
                this.currentAccesses = currentNodes;
                this.setFields(false);

            }
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.currentAccesses = nodes ? nodes : [];
        super.provideValue(nodes ? nodes.map((n) => n.id) : null);
        this.setFields();
    }

    private async setFields(clear: boolean = true): Promise<void> {
        if (!this.state.field.children || !this.state.field.children.length || clear) {
            const formService = ServiceRegistry.getServiceInstance<ContactFormService>(
                KIXObjectType.CONTACT, ServiceType.FORM
            );
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);

            if (formService && formInstance) {
                if (this.currentAccesses) {
                    const childFields = await formService.getFormFieldsForAccess(
                        this.currentAccesses.map((n) => n.id), this.state.formId
                    );
                    formInstance.addFieldChildren(this.state.field, childFields, true);
                } else {
                    formInstance.addFieldChildren(this.state.field, [], true);
                }
            }
        }
    }

    private async getNodes(unique: boolean = false): Promise<TreeNode[]> {
        const agentLabel = await TranslationService.translate('Translatable#Agent Portal');
        const customerLabel = await TranslationService.translate('Translatable#Customer Portal');
        return [
            new TreeNode(UserProperty.IS_AGENT, agentLabel),
            new TreeNode(UserProperty.IS_CUSTOMER, customerLabel)
        ];
    }
}

module.exports = Component;
