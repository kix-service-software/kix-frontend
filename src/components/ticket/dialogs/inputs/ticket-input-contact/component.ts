import { ComponentState } from "./ComponentState";
import {
    Contact, FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions
} from "../../../../../core/model";
import { FormService, FormInputAction } from "../../../../../core/browser/form";
import {
    KIXObjectService, Label, TabContainerEvent, TabContainerEventData,
    ContextService
} from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { EventService } from "../../../../../core/browser/event";
import { NewContactDialogContext } from "../../../../../core/browser/contact";
import { PreviousTabData } from "../../../../../core/browser/components/dialog";
import { NewTicketDialogContext } from "../../../../../core/browser/ticket";

class Component extends FormInputComponent<string, ComponentState> {

    private contacts: Contact[];

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
        this.state.searchCallback = this.searchContacts.bind(this);
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        this.state.autoCompleteConfiguration = formInstance.getAutoCompleteConfiguration();

        const additionalTypeOption = this.state.field.options.find((o) => o.option === 'SHOW_NEW_CONTACT');
        const actions = [];
        if (additionalTypeOption && additionalTypeOption.value) {
            actions.push(new FormInputAction(
                'NEW_CONTACT',
                new Label(
                    null, 'NEW_CONTACT', 'kix-icon-man-bubble-new', null, null,
                    await TranslationService.translate('Translatable#New Contact')
                ),
                this.actionClicked.bind(this), false
            ));
        }

        this.state.actions = actions;

        this.setCurrentNode();
    }

    private async actionClicked(action: FormInputAction): Promise<void> {
        const newContactDialogContext = await ContextService.getInstance().getContext<NewContactDialogContext>(
            NewContactDialogContext.CONTEXT_ID
        );
        if (newContactDialogContext) {
            newContactDialogContext.setAdditionalInformation('RETURN_TO_PREVIOUS_TAB', new PreviousTabData(
                KIXObjectType.TICKET,
                'new-ticket-dialog'
            ));
            EventService.getInstance().publish(
                TabContainerEvent.CHANGE_TAB, new TabContainerEventData('new-contact-dialog')
            );
        }
    }

    public async setCurrentNode(): Promise<void> {
        const newTicketDialogContext = await ContextService.getInstance().getContext<NewTicketDialogContext>(
            NewTicketDialogContext.CONTEXT_ID
        );
        let newContactId = null;
        if (newTicketDialogContext) {
            newContactId = newTicketDialogContext.getAdditionalInformation(`${KIXObjectType.CONTACT}-ID`);
        }
        if (newContactId || (this.state.defaultValue && this.state.defaultValue.value)) {
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, [newContactId || this.state.defaultValue.value]
            );
            if (contacts && contacts.length) {
                const contact = contacts[0];
                this.state.currentNode = this.createTreeNode(contact);
                this.state.nodes = [this.state.currentNode];
                super.provideValue(contact.ContactID);
            }
        }
    }

    public contactChanged(nodes: TreeNode[]): void {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        super.provideValue(this.state.currentNode ? this.state.currentNode.id : null);
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, searchValue, limit);
        this.contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, false
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            this.state.nodes = this.contacts.map(
                (c) => this.createTreeNode(c)
            );
        }

        return this.state.nodes;
    }

    private createTreeNode(contact: Contact): TreeNode {
        return new TreeNode(contact.ContactID, contact.DisplayValue, 'kix-icon-man-bubble');
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }
}

module.exports = Component;
