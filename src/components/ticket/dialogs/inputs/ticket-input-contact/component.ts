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
    Contact, FormInputComponent, KIXObjectType,
    TreeNode, KIXObjectLoadingOptions, FilterCriteria, ContactProperty, FilterDataType, FilterType
} from "../../../../../core/model";
import { FormService, FormInputAction } from "../../../../../core/browser/form";
import {
    KIXObjectService, Label, TabContainerEvent, TabContainerEventData,
    ContextService,
    LabelService,
    SearchOperator
} from "../../../../../core/browser";
import { TranslationService } from "../../../../../core/browser/i18n/TranslationService";
import { EventService } from "../../../../../core/browser/event";
import { NewContactDialogContext, ContactService } from "../../../../../core/browser/contact";
import { PreviousTabData } from "../../../../../core/browser/components/dialog";
import { NewTicketDialogContext } from "../../../../../core/browser/ticket";
import { FormValidationService } from "../../../../../core/browser/form/validation";

class Component extends FormInputComponent<number | string, ComponentState> {

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
        let contactId: number | string = null;
        if (newTicketDialogContext) {
            contactId = newTicketDialogContext.getAdditionalInformation(`${KIXObjectType.CONTACT}-ID`);
        }

        if (contactId || (this.state.defaultValue && this.state.defaultValue.value)) {
            contactId = contactId || this.state.defaultValue.value;
            if (!isNaN(Number(contactId))) {
                this.setContact(Number(contactId));
            } else {
                this.state.currentNode = new TreeNode(contactId, contactId.toString(), 'kix-icon-man-bubble');
                this.state.nodes = [this.state.currentNode];
            }
            super.provideValue(contactId);
        }
    }

    public async contactChanged(nodes: TreeNode[]): Promise<void> {
        this.state.currentNode = nodes && nodes.length ? nodes[0] : null;
        let contactId = this.state.currentNode ? this.state.currentNode.id : null;
        if (contactId) {
            if (!isNaN(contactId)) {
                await this.setContact(contactId);
            } else {
                contactId = await this.handleUnknownContactId(contactId);
            }
        }
        super.provideValue(contactId);
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const filter = await ContactService.getInstance().prepareFullTextFilter(searchValue);
        const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
        this.contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, true
        );

        this.state.nodes = [];
        if (searchValue && searchValue !== '') {
            const nodes = [];
            for (const c of this.contacts) {
                const node = await this.createTreeNode(c);
                nodes.push(node);
            }
            this.state.nodes = nodes;
        }

        return this.state.nodes;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async setContact(contactId: number): Promise<void> {
        const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [contactId]);
        if (contacts && contacts.length) {
            const contact = contacts[0];
            this.state.currentNode = await this.createTreeNode(contact);
            this.state.nodes = [this.state.currentNode];
            contactId = contact.ID;
        }
    }

    private async handleUnknownContactId(contactId: number | string): Promise<string | number> {
        if (FormValidationService.getInstance().isValidEmail(contactId.toString())) {
            const loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    ContactProperty.EMAIL, SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, contactId
                )
            ]);
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions
            );
            if (contacts && contacts.length) {
                const contact = contacts[0];
                this.state.currentNode = await this.createTreeNode(contact);
                this.state.nodes = [this.state.currentNode];
                contactId = contact.ID;
            }
        } else {
            contactId = null;
        }

        return contactId;
    }

    private async createTreeNode(contact: Contact): Promise<TreeNode> {
        const displayValue = await LabelService.getInstance().getText(contact);
        return new TreeNode(contact.ID, displayValue, 'kix-icon-man-bubble');
    }
}

module.exports = Component;
