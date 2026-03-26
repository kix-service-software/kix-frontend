/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../../model/configuration/AutoCompleteConfiguration';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { DataType } from '../../../../../../model/DataType';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { SortUtil } from '../../../../../../model/SortUtil';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { FormValidationService } from '../../../../../base-components/webapp/core/FormValidationService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { PlaceholderService } from '../../../../../base-components/webapp/core/PlaceholderService';
import { TreeNode, TreeUtil } from '../../../../../base-components/webapp/core/tree';
import { Contact } from '../../../../../customer/model/Contact';
import { ContactProperty } from '../../../../../customer/model/ContactProperty';
import { ContactService } from '../../../../../customer/webapp/core/ContactService';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { Ticket } from '../../../../model/Ticket';
import { TicketProperty } from '../../../../model/TicketProperty';
import { TicketService } from '../../TicketService';

export class ContactObjectFormValue extends SelectObjectFormValue<string | number> {

    objectBindingId: string;

    public canCreateContact: boolean;
    public ORGA_DETERMINES_CONTACT: boolean;

    private valueInitialized: boolean;

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, ticket, objectValueMapper, parent);

        this.objectType = KIXObjectType.CONTACT;
        this.isAutoComplete = true;
        this.multiselect = false;
        this.autoCompleteConfiguration = new AutoCompleteConfiguration();

        this.loadingOptions = new KIXObjectLoadingOptions();
        this.loadingOptions.includes = [KIXObjectProperty.DYNAMIC_FIELDS, KIXObjectType.USER];

        this.canCreateContact = true;
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);

        const option = field?.options?.find((o) => o.option === 'SHOW_NEW_CONTACT');
        const isDefined = option && option.value !== null && option.value !== 'undefinded';
        if (isDefined && !BrowserUtil.isBooleanTrue(option?.value)) {
            this.canCreateContact = false;
        }
    }

    public async initFormValue(): Promise<void> {
        this.freeText = true;
        await super.initFormValue();
        this.setContactValue(undefined, true);
    }

    public async postInitFormValue(): Promise<void> {
        TicketService.getTicketModuleConfiguration()
            .then((config) => {
                if (config?.organisationDeterminesContact) {
                    this.ORGA_DETERMINES_CONTACT = true;
                }

                this.valueInitialized = true;

                if (this.ORGA_DETERMINES_CONTACT) {
                    this.autoCompleteConfiguration = undefined;
                    this.isAutoComplete = false;

                    this.objectBindingId = this.objectValueMapper?.object?.addBinding(
                        TicketProperty.ORGANISATION_ID,
                        async (value: number) => {
                            this.loadSelectableValues().then(() => this.setContactValue(value));
                        }
                    );
                    this.loadSelectableValues();
                }
            })
            .catch(() => null);
    }

    public async loadSelectableValues(): Promise<void> {
        if (this.valueInitialized && this.ORGA_DETERMINES_CONTACT) {
            const organisationValue = (this.objectValueMapper.findFormValue(
                TicketProperty.ORGANISATION_ID
            )) as SelectObjectFormValue;
            const selectedOrgaValue = this.initialized && organisationValue?.isInitialized()
                ? organisationValue?.value
                : organisationValue?.value || organisationValue?.defaultValue;

            if (selectedOrgaValue) {
                const orgaId = Number(Array.isArray(selectedOrgaValue) ? selectedOrgaValue[0] : selectedOrgaValue);
                if (!isNaN(orgaId)) {

                    const orgFilter = new FilterCriteria(
                        ContactProperty.ORGANISATION_IDS, SearchOperator.IN,
                        FilterDataType.NUMERIC, FilterType.AND, [orgaId]
                    );
                    const oldOrgaFilter = this.loadingOptions.filter.find(
                        (f) => f.property === ContactProperty.ORGANISATION_IDS && f.operator === SearchOperator.IN
                    );
                    if (oldOrgaFilter) {
                        oldOrgaFilter.value = [orgaId];
                    } else {
                        this.loadingOptions.filter.push(orgFilter);
                    }

                    const contacts = await KIXObjectService.loadObjects<Contact>(
                        KIXObjectType.CONTACT, undefined, this.loadingOptions
                    );

                    const nodes = await ContactService.getInstance().prepareObjectTree(
                        contacts, this.showInvalidNodes, this.isInvalidClickable
                    );

                    SortUtil.sortObjects(nodes, 'label', DataType.STRING);

                    const possibleValues = contacts.map((c) => c.ID);
                    if (JSON.stringify(this.possibleValues) !== JSON.stringify(possibleValues)) {
                        this.possibleValues = possibleValues;
                    }
                    this.treeHandler.setTree(nodes, undefined, true);
                } else {
                    this.clearPossibleValuesAndNodes();
                }
            } else {
                this.clearPossibleValuesAndNodes();
            }
        } else if (this.valueInitialized) {
            return super.loadSelectableValues();
        }
    }

    public destroy(): void {
        if (this.objectBindingId?.length && this.objectValueMapper?.object) {
            this.objectValueMapper.object.removeBindings([this.objectBindingId]);
        }
        super.destroy();
    }
    private async setContactValue(orgaId?: number, init?: boolean): Promise<void> {
        let contactId: number | string = null;

        const context = ContextService.getInstance().getActiveContext();

        let initialContactId = context.getAdditionalInformation(TicketProperty.CONTACT_ID);
        if (!initialContactId) {
            const contact = context.getAdditionalInformation(KIXObjectType.CONTACT);
            initialContactId = contact?.ID;
        }

        if (init && this.empty) {
            contactId = null;
        } else if (init && initialContactId) {
            contactId = initialContactId;
        } else if (init && this.defaultValue) {
            contactId = this.defaultValue;
            if (Array.isArray(this.defaultValue)) {
                contactId = this.defaultValue[0];
            }
        } else if (!orgaId && this.ORGA_DETERMINES_CONTACT && !init) {
            await this.setFormValue(null, true);
        } else if (orgaId && this.value && this.ORGA_DETERMINES_CONTACT) {
            if (!this.possibleValues.some((cid) => cid.toString() === this.value.toString())) {
                await this.setFormValue(null, true);
            }
        }

        if (contactId) {
            const node = this.treeHandler.getTree().find((n) => n.id.toString() === contactId.toString());
            if (node && !node.selected) {
                this.treeHandler.setSelection([node], true);
            }
            await this.setFormValue(contactId, true);
        }
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        let newValue = null;
        if (value) {
            if (Array.isArray(value)) {
                newValue = value[0];
            } else {
                newValue = value;
            }

            // if unknown contact
            if (newValue && isNaN(Number(newValue))) {
                newValue = await this.getPossibleContactId(newValue);
            }
        }
        return await super.setFormValue(newValue, force);
    }

    private clearPossibleValuesAndNodes(): void {
        // clear only if necessary
        if (this.possibleValues?.length) {
            this.possibleValues = [];
        }
        if (this.treeHandler?.getTree()) {
            this.treeHandler.setTree([]);
        }
    }

    public async setObjectValue(value: (string | number)[]): Promise<void> {
        let contactId = null;

        if (Array.isArray(value)) {
            contactId = value[0];
        } else {
            contactId = value;
        }

        if (contactId) {
            const nodes = this.getSelectableTreeNodeValues();
            const currentNode = TreeUtil.findNode(nodes, contactId);
            contactId = currentNode?.id || contactId;
            if (isNaN(contactId)) {
                contactId = await this.getPossibleContactId(contactId);
            }
        }

        // if unknown contact
        if (contactId && isNaN(Number(contactId))) {
            const node = new TreeNode(value, value.toString());
            this.treeHandler.setTree([node]);
            this.treeHandler.setSelection([node], true, true);
        }

        await super.setObjectValue(contactId);
    }

    private async getPossibleContactId(contactId: number | string): Promise<string | number> {
        const placeholders = PlaceholderService.getInstance().extractPlaceholders(contactId?.toString());
        if (placeholders.length) {
            return contactId;
        }

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
}