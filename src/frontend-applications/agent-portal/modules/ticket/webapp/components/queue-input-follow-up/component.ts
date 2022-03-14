/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { QueueService } from '../../core';
import { QueueProperty } from '../../../model/QueueProperty';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends FormInputComponent<number, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
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
        await super.onMount();
    }

    public async load(): Promise<TreeNode[]> {
        const nodes = await QueueService.getInstance().getTreeNodes(QueueProperty.FOLLOW_UP_ID);
        await this.setCurrentNode(nodes);
        return nodes;
    }

    public async setCurrentValue(): Promise<void> {
        return;
    }

    protected async setCurrentNode(nodes: TreeNode[]): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const defaultValue = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);
        if (defaultValue && defaultValue.value) {
            if (defaultValue.value) {
                const node = nodes.find((n) => n.id === defaultValue.value);
                if (node) {
                    node.selected = true;
                }
            }
        }
    }

    public followUpChanged(nodes: TreeNode[]): void {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(currentNode ? currentNode.id : null);
        this.showFollowUpLock();
    }

    private async showFollowUpLock(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        let field = this.state.field?.children.find((f) => f.property === QueueProperty.FOLLOW_UP_LOCK);

        const value = formInstance.getFormFieldValue(this.state.field?.instanceId);
        const showLockField = value && value.value && value.value === 1;

        if (field && !showLockField) {
            formInstance.removeFormField(field);
        } else if (!field && showLockField) {
            const label = await LabelService.getInstance().getPropertyText(
                QueueProperty.FOLLOW_UP_LOCK, KIXObjectType.QUEUE
            );
            field = new FormFieldConfiguration(
                'followup-field',
                label, QueueProperty.FOLLOW_UP_LOCK, 'checkbox-input', false,
                'Translatable#Helptext_Admin_QueueCreate_FollowUpTicketLock', null,
                new FormFieldValue(true)
            );
            formInstance.addFieldChildren(this.state.field, [field]);
        }
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
