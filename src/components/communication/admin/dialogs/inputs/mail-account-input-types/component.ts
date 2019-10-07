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
    TreeNode, FormInputComponent, MailAccountProperty, KIXObjectType, FormField, FormFieldValue
} from "../../../../../../core/model";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";
import { MailAccountService } from "../../../../../../core/browser/mail-account";
import { FormService, LabelService } from "../../../../../../core/browser";

class Component extends FormInputComponent<string, ComponentState> {

    private typeID: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public async load(): Promise<TreeNode[]> {
        const nodes = await MailAccountService.getInstance().getTreeNodes(MailAccountProperty.TYPE);
        this.setCurrentNode(nodes);
        this.handleIMAPFolderField();
        return nodes;
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

    }

    public setCurrentNode(nodes: TreeNode[]): void {
        let node: TreeNode;
        if (this.state.defaultValue && this.state.defaultValue.value) {
            node = nodes.find((n) => n.id === this.state.defaultValue.value);
        } else {
            node = nodes.find((n) => n.id === 'IMAP');
        }
        if (node) {
            node.selected = true;
            this.typeID = node.id;
        }

        super.provideValue(this.typeID);
    }

    public typeChanged(nodes: TreeNode[]): void {
        this.typeID = nodes && nodes.length ? nodes[0].id : null;
        super.provideValue(this.typeID);
        this.handleIMAPFolderField();
    }

    private async handleIMAPFolderField(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        let field = this.state.field.children.find((f) => f.property === MailAccountProperty.IMAP_FOLDER);
        const showFolderField = this.showIMAPFolderField();
        if (field && !showFolderField) {
            formInstance.removeFormField(field, this.state.field);
        } else if (!field && showFolderField) {
            const label = await LabelService.getInstance().getPropertyText(
                MailAccountProperty.IMAP_FOLDER, KIXObjectType.MAIL_ACCOUNT
            );
            field = new FormField(
                label, MailAccountProperty.IMAP_FOLDER, null, false,
                'Translatable#Helptext_Admin_MailAccountCreate_IMAPFolder', undefined,
                new FormFieldValue('INBOX')
            );
            formInstance.addNewFormField(this.state.field, [field]);
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
