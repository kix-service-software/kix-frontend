import { ComponentState } from "./ComponentState";
import {
    TreeNode, FormInputComponent, MailAccountProperty, KIXObjectType, FormField, FormFieldValue
} from "../../../../../../core/model";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";
import { MailAccountService } from "../../../../../../core/browser/mail-account";
import { FormService, LabelService } from "../../../../../../core/browser";

class Component extends FormInputComponent<number[], ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
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

        const typeNodes = await MailAccountService.getInstance().getTreeNodes(MailAccountProperty.TYPE);
        this.state.nodes = typeNodes;
        this.setCurrentNode();
        this.handleIMAPFolderField();
    }

    public setCurrentNode(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.currentNode = this.state.nodes.find((n) => n.id === this.state.defaultValue.value);
        } else {
            this.state.currentNode = this.state.nodes.find((n) => n.id === 'IMAP');
        }
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    public typeChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
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
        let show = false;
        if (this.state.currentNode && this.state.currentNode.id.match(/^IMAP/)) {
            show = true;
        }
        return show;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
