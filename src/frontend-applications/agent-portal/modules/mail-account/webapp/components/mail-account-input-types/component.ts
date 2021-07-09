/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { TreeNode, TreeService, TreeHandler } from '../../../../base-components/webapp/core/tree';
import { MailAccountService } from '../../core';
import { MailAccountProperty } from '../../../model/MailAccountProperty';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { IdService } from '../../../../../model/IdService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

class Component extends FormInputComponent<string, ComponentState> {

    private typeID: string;
    public treeId: string;

    public onCreate(): void {
        this.treeId = IdService.generateDateBasedId('mail-account-input-types-'),
            this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public async load(): Promise<void> {
        const nodes = await MailAccountService.getInstance().getTreeNodes(MailAccountProperty.TYPE);
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
        const formValue = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);
        const treeHandler = TreeService.getInstance().getTreeHandler(this.treeId);
        if (formValue && treeHandler) {
            const nodes = treeHandler.getTree();
            const currentNode = nodes.find((n) => n.id === formValue.value);
            if (currentNode) {
                currentNode.selected = true;
                this.typeID = currentNode.id;
            }

            treeHandler.setSelection([currentNode], true, true, true);
        }
        return;
    }

    public typeChanged(nodes: TreeNode[]): void {
        this.typeID = nodes && nodes.length ? nodes[0].id : null;
        super.provideValue(this.typeID);
        this.handleIMAPFolderField();
    }

    private async handleIMAPFolderField(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        let field = this.state.field?.children.find((f) => f.property === MailAccountProperty.IMAP_FOLDER);
        const showFolderField = this.showIMAPFolderField();
        if (field && !showFolderField) {
            formInstance.removeFormField(field);
        } else if (!field && showFolderField) {
            const label = await LabelService.getInstance().getPropertyText(
                MailAccountProperty.IMAP_FOLDER, KIXObjectType.MAIL_ACCOUNT
            );
            field = new FormFieldConfiguration(
                'imap-field',
                label, MailAccountProperty.IMAP_FOLDER, null, false,
                'Translatable#Helptext_Admin_MailAccountCreate_IMAPFolder', undefined,
                new FormFieldValue('INBOX')
            );
            formInstance.addFieldChildren(this.state.field, [field]);
        }
    }

    private showIMAPFolderField(): boolean {
        return this.typeID && this.typeID.match(/^IMAP/) !== null;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
