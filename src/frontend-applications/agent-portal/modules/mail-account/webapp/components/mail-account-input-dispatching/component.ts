/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TreeNode, TreeService, TreeHandler } from '../../../../base-components/webapp/core/tree';
import { MailAccountFormService, MailAccountService } from '../../core';
import { MailAccountProperty } from '../../../model/MailAccountProperty';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ServiceRegistry } from '../../../../base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../../base-components/webapp/core/ServiceType';

class Component extends FormInputComponent<string, ComponentState> {

    private dispatchKey: string;
    public treeId: string;

    public onCreate(): void {
        this.treeId = IdService.generateDateBasedId('mail-account-input-dispatching-');
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public async load(): Promise<void> {
        const nodes = await MailAccountService.getInstance().getTreeNodes(MailAccountProperty.DISPATCHING_BY);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes, null, true);
        }
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update();
    }

    public async update(): Promise<void> {
        const placeholderText = this.state.field?.placeholder
            ? this.state.field?.placeholder
            : this.state.field?.required ? this.state.field?.label : '';

        this.state.placeholder = await TranslationService.translate(placeholderText);
    }

    public async onMount(): Promise<void> {
        const treeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler(this.treeId, treeHandler);
        await this.load();
        await super.onMount();

        this.state.prepared = true;
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
        TreeService.getInstance().removeTreeHandler(this.treeId);
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const formValue = formInstance.getFormFieldValue<string>(this.state.field?.instanceId);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.treeId);
        if (formValue && treeHandler) {
            const nodes = treeHandler.getTree();
            const currentNode = nodes.find((n) => n.id === formValue.value);
            if (currentNode) {
                currentNode.selected = true;
                this.dispatchKey = currentNode.id;
            }

            treeHandler.setSelection([currentNode], true, true, true);
        }
        return;
    }

    public async dispatchChanged(nodes: TreeNode[]): Promise<void> {
        this.dispatchKey = nodes && nodes.length ? nodes[0].id : null;
        super.provideValue(this.dispatchKey);
        await this.handleSelectionField();
    }

    private async handleSelectionField(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        let field = this.state.field?.children.find((f) => f.property === MailAccountProperty.QUEUE_ID);
        const showField = this.isQueueType();
        if (field && !showField) {
            formInstance.removeFormField(field);
        } else if (!field && showField) {
            const formService = ServiceRegistry.getServiceInstance<MailAccountFormService>(
                formInstance.getObjectType(), ServiceType.FORM
            );
            field = await formService?.getQueueField();
            if (field) {
                formInstance.addFieldChildren(this.state.field, [field], undefined, true);
            }
        }
    }

    private isQueueType(): boolean {
        return this.dispatchKey && this.dispatchKey.match(/^Queue$/) !== null;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
