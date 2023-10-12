/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ComponentState } from './ComponentState';
import { TreeNode, TreeHandler, TreeService } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { ServiceRegistry } from '../../../../base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ServiceType } from '../../../../base-components/webapp/core/ServiceType';
import { SortUtil } from '../../../../../model/SortUtil';
import { UserProperty } from '../../../../user/model/UserProperty';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { ContactFormService } from '../../core/ContactFormService';

class Component extends FormInputComponent<string[], ComponentState> {

    private currentAccesses: TreeNode[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async onMount(): Promise<void> {
        const treeHandler = new TreeHandler([], null, null, true);
        TreeService.getInstance().registerTreeHandler(this.state.treeId, treeHandler);
        await this.load();
        await super.onMount();

        this.state.prepared = true;
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    private async load(): Promise<void> {
        const nodes = await this.getNodes();
        nodes.sort((a, b) => {
            return SortUtil.compareString(a[1], b[1]);
        });

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes, null, true);
        }

        (this as any).setStateDirty('field');
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<number[] | number>(this.state.field?.instanceId);
        if (value) {
            const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
            if (treeHandler) {
                const nodes = treeHandler.getTree();
                let selectedNodes = [];
                if (Array.isArray(value.value)) {
                    selectedNodes = nodes.filter(
                        (eventNode) => (value.value as number[]).some((v) => v === eventNode.id)
                    );
                } else {
                    selectedNodes = nodes.filter(
                        (eventNode) => eventNode.id === value.value
                    );
                }

                treeHandler.setSelection(selectedNodes, true, true, true);
            }
        }
    }

    public nodesChanged(nodes: TreeNode[]): void {
        this.currentAccesses = nodes ? nodes : [];
        super.provideValue(nodes ? nodes.map((n) => n.id) : null);
        this.setFields();
    }

    private async setFields(clear: boolean = true): Promise<void> {
        if (!this.state.field?.children || !this.state.field?.children.length || clear) {
            const formService = ServiceRegistry.getServiceInstance<ContactFormService>(
                KIXObjectType.CONTACT, ServiceType.FORM
            );
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();

            if (formService && formInstance) {
                if (this.currentAccesses) {
                    const childFields = await formService.getFormFieldsForAccess(
                        this.currentAccesses.map((n) => n.id), formInstance
                    );
                    formInstance.addFieldChildren(this.state.field, childFields, true);
                } else {
                    formInstance.addFieldChildren(this.state.field, [], true);
                }
            }
        }
    }

    private async getNodes(): Promise<TreeNode[]> {
        const agentLabel = await TranslationService.translate('Translatable#Agent Portal');
        const customerLabel = await TranslationService.translate('Translatable#Customer Portal');
        return [
            new TreeNode(
                UserProperty.IS_AGENT, agentLabel,
                new ObjectIcon(null, 'agent-portal-icon-sw', 'agent-portal-icon-sw')
            ),
            new TreeNode(UserProperty.IS_CUSTOMER, customerLabel, 'fas fa-users')
        ];
    }
}

module.exports = Component;
