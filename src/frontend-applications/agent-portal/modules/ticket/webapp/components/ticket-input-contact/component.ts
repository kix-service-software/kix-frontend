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
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { FormInputAction } from '../../../../../modules/base-components/webapp/core/FormInputAction';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FormValidationService } from '../../../../../modules/base-components/webapp/core/FormValidationService';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { IKIXObjectService } from '../../../../../modules/base-components/webapp/core/IKIXObjectService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { Contact } from '../../../../customer/model/Contact';
import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { FormFieldOptions } from '../../../../../model/configuration/FormFieldOptions';
import { NewContactDialogContext } from '../../../../customer/webapp/core';

class Component extends FormInputComponent<number | string, ComponentState> {

    private contacts = [];

    public constructor() {
        super();
    }

    public onCreate(): void {
        this.state = new ComponentState();
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

        (this as any).setStateDirty('field');
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.searchCallback = this.searchContacts.bind(this);
        this.state.autoCompleteConfiguration = new AutoCompleteConfiguration();

        const additionalTypeOption = this.state.field?.options.find((o) => o.option === 'SHOW_NEW_CONTACT');
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
    }

    private async actionClicked(action: FormInputAction): Promise<void> {
        ContextService.getInstance().setActiveContext(
            NewContactDialogContext.CONTEXT_ID, null, null, [
            ['USE_SOURCE_CONTEXT', true],
            ['PROVIDE_CONTACT_ID_TO_SOURCE_CONTEXT', true]
        ]
        );
    }

    public async setCurrentValue(): Promise<void> {
        let nodes = [];
        const newTicketDialogContext = ContextService.getInstance().getActiveContext();

        let contactId: number | string = null;

        if (newTicketDialogContext) {
            contactId = newTicketDialogContext.getAdditionalInformation(`${KIXObjectType.CONTACT}-ID`);
            if (contactId) {
                super.provideValue(contactId);
            }
        }

        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const contactValue = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);

        contactId = contactId
            ? contactId
            : Array.isArray(contactValue?.value) ? contactValue?.value[0] : contactValue?.value;
        if (contactId) {
            if (!isNaN(Number(contactId))) {
                // check if this contact is valid, if required
                const onlyValidOption = this.state.field?.options.find((o) =>
                    o.option === FormFieldOptions.SHOW_INVALID);
                let canSelect = true;
                if (onlyValidOption && !onlyValidOption.value) {
                    const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, [contactId]);
                    if (!contacts || !contacts.length || contacts[0].ValidID !== 1) {
                        canSelect = false;
                    }
                }
                if (canSelect) {
                    const currentNode = await this.getContactNode(Number(contactId));
                    if (currentNode) {
                        nodes.push(currentNode);
                        currentNode.selected = true;
                    }
                }
            } else {
                const currentNode = new TreeNode(contactId, contactId.toString(), 'kix-icon-man-bubble');
                currentNode.selected = true;
                nodes = [currentNode];
            }
        }

        const treeHandler = TreeService.getInstance().getTreeHandler(this.state.treeId);
        if (treeHandler) {
            treeHandler.setTree(nodes);
        }
    }

    public async nodesChanged(nodes: TreeNode[]): Promise<void> {
        const currentNode = nodes && nodes.length ? nodes[0] : null;
        let contactId = currentNode ? currentNode.id : null;
        if (contactId) {
            if (isNaN(contactId)) {
                contactId = await this.handleUnknownContactId(contactId);
            }
        }
        super.provideValue(contactId);
    }

    private async getContactNode(contactId: number): Promise<TreeNode> {
        const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, [contactId]);
        if (contacts && contacts.length) {
            const contact = contacts[0];
            const node = await this.createTreeNode(contact);
            return node;
        }

        return null;
    }

    private async searchContacts(limit: number, searchValue: string): Promise<TreeNode[]> {
        const nodes = [];
        const service = ServiceRegistry.getServiceInstance<IKIXObjectService>(KIXObjectType.CONTACT);
        if (service) {
            const onlyValidOption = this.state.field?.options.find((o) => o.option === FormFieldOptions.SHOW_INVALID);
            const filter = await service.prepareFullTextFilter(searchValue);
            if (onlyValidOption && !onlyValidOption.value) {
                filter.push(
                    new FilterCriteria(
                        KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                        FilterType.AND, 1
                    )
                );
            }
            const loadingOptions = new KIXObjectLoadingOptions(filter, null, limit);
            this.contacts = await KIXObjectService.loadObjects(
                KIXObjectType.CONTACT, null, loadingOptions, null, true
            );

            if (searchValue && searchValue !== '') {
                for (const c of this.contacts) {
                    const node = await this.createTreeNode(c);
                    nodes.push(node);
                }
            }
        }

        return nodes;
    }

    public async focusLost(event: any): Promise<void> {
        await super.focusLost();
    }

    private async handleUnknownContactId(contactId: number | string): Promise<string | number> {
        if (FormValidationService.getInstance().isValidEmail(contactId.toString())) {
            const loadingOptions = new KIXObjectLoadingOptions([
                new FilterCriteria(
                    'Email', SearchOperator.EQUALS, FilterDataType.STRING,
                    FilterType.AND, contactId
                )
            ]);
            const contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, null, true
            ).catch(() => null);
            if (contacts?.length) {
                contactId = contacts[0].ID;
            }
        } else {
            contactId = null;
        }

        return contactId;
    }

    private async createTreeNode(contact: KIXObject): Promise<TreeNode> {
        const displayValue = await LabelService.getInstance().getObjectText(contact);
        return new TreeNode(contact.ObjectId, displayValue, 'kix-icon-man-bubble');
    }
}

module.exports = Component;
