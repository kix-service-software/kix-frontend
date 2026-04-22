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
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { SortUtil } from '../../../../../../model/SortUtil';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { TimeoutTimer } from '../../../../../base-components/webapp/core/TimeoutTimer';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { Contact } from '../../../../../customer/model/Contact';
import { Organisation } from '../../../../../customer/model/Organisation';
import { OrganisationProperty } from '../../../../../customer/model/OrganisationProperty';
import { OrganisationService } from '../../../../../customer/webapp/core/OrganisationService';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Ticket } from '../../../../model/Ticket';
import { TicketProperty } from '../../../../model/TicketProperty';
import { TicketService } from '../../TicketService';

export class OrganisationObjectFormValue extends SelectObjectFormValue<number | string> {

    objectBindingId: string;

    private setFormValueTimeout: TimeoutTimer;
    public ORGA_DETERMINES_CONTACT: boolean;

    private valueInitialized: boolean;

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, ticket, objectValueMapper, parent);

        this.objectType = KIXObjectType.ORGANISATION;
        this.isAutoComplete = false;
        this.hasFilter = false;
        this.multiselect = false;

        this.setFormValueTimeout = new TimeoutTimer();
        this.loadingOptions = new KIXObjectLoadingOptions();
        this.loadingOptions.includes = [OrganisationProperty.SUB_ORGANISATIONS];
        this.loadingOptions.expands = [OrganisationProperty.SUB_ORGANISATIONS];
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        return super.initFormValueByField(field);
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        await this.setOrganisationValue(null, true);
    }

    public async postInitFormValue(): Promise<void> {
        TicketService.getTicketModuleConfiguration()
            .then((config) => {
                if (config?.organisationDeterminesContact) {
                    this.ORGA_DETERMINES_CONTACT = true;
                    this.isAutoComplete = true;
                    this.autoCompleteConfiguration = new AutoCompleteConfiguration();
                    this.hasFilter = true;
                }

                this.valueInitialized = true;

                if (!this.ORGA_DETERMINES_CONTACT) {
                    const contactFV = this.objectValueMapper.findFormValue(TicketProperty.CONTACT_ID);
                    if (contactFV?.value) {
                        this.loadSelectableValues().then(
                            () => this.setOrganisationValue(contactFV.value).then(
                                () => this.objectValueMapper?.validateFormValue(this, true)
                            )
                        );
                    }

                    this.objectBindingId = this.objectValueMapper?.object?.addBinding(
                        TicketProperty.CONTACT_ID,
                        async (value: number) => {
                            this.loadSelectableValues().then(
                                () => this.setOrganisationValue(value).then(
                                    () => this.objectValueMapper?.validateFormValue(this, true)
                                )
                            );
                        }
                    );
                } else if (this.objectValueMapper?.objectFormHandler?.configurationMode) {
                    const contactFV = this.objectValueMapper.findFormValue(TicketProperty.CONTACT_ID);
                    if (contactFV) {
                        this.objectValueMapper.objectFormHandler.reInitField(contactFV.fieldId);
                    }
                }
            }).catch(() => null);
    }

    public destroy(): void {
        if (this.objectBindingId?.length && this.objectValueMapper?.object) {
            this.objectValueMapper.object.removeBindings([this.objectBindingId]);
        }
        super.destroy();
    }

    public async loadSelectableValues(): Promise<void> {
        if (
            !this.ORGA_DETERMINES_CONTACT && (
                this.valueInitialized
                || this.objectValueMapper?.objectFormHandler?.configurationMode
            )
        ) {
            const contactValue = (
                this.objectValueMapper.findFormValue(TicketProperty.CONTACT_ID)
            ) as SelectObjectFormValue;
            const selectedContactValue = this.initialized && contactValue?.isInitialized() ?
                contactValue?.value : contactValue?.value || contactValue?.defaultValue;
            if (selectedContactValue) {
                const contactId = Array.isArray(selectedContactValue) ? selectedContactValue[0] : selectedContactValue;
                if (!isNaN(Number(contactId))) {
                    const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, [contactId])
                        .catch((): Contact[] => []);
                    if (contacts.length) {
                        const contact = contacts[0];

                        const organisations = await KIXObjectService.loadObjects<Organisation>(
                            KIXObjectType.ORGANISATION, contact.OrganisationIDs, this.loadingOptions
                        );

                        const nodes = await OrganisationService.getInstance().prepareObjectTree(
                            organisations, this.showInvalidNodes, this.isInvalidClickable, contact.OrganisationIDs
                        );

                        SortUtil.sortObjects(nodes, 'label', DataType.STRING);

                        // check for changed value to prevent infinite loop by triggered valueSetter listener
                        const possibleValues = contact.OrganisationIDs.filter(
                            (id) => this.findOrgansiationNode(nodes, id)
                        );
                        if (JSON.stringify(this.possibleValues) !== JSON.stringify(possibleValues)) {
                            this.possibleValues = possibleValues;
                        }
                        this.treeHandler.setTree(nodes, undefined, true);
                    }
                } else if (typeof contactId === 'string') {
                    this.clearPossibleValuesAndNodes();
                }
            }
        } else if (this.valueInitialized || this.objectValueMapper?.objectFormHandler?.configurationMode) {
            return super.loadSelectableValues();
        }
    }

    private findOrgansiationNode(nodes: TreeNode[], id: string | number): boolean {
        return nodes.some((node) => {
            if (node.id === id) {
                return true;
            } else if (node.children?.length) {
                if (this.findOrgansiationNode(node.children, id)) {
                    return true;
                }
            }
        });
    }

    private async setOrganisationValue(contactId?: number, init?: boolean): Promise<void> {
        let organisationId: number | string = null;

        const context = ContextService.getInstance().getActiveContext();
        let initialOrgId = context.getAdditionalInformation(TicketProperty.ORGANISATION_ID);
        if (!initialOrgId) {
            const contact = context.getAdditionalInformation(KIXObjectType.CONTACT);
            initialOrgId = contact?.PrimaryOrganisationID;
        }
        if (init && this.empty) {
            organisationId = null;
        } else if (init && initialOrgId) {
            organisationId = initialOrgId;
        } else if (init && this.defaultValue) {
            organisationId = this.defaultValue;
            if (Array.isArray(this.defaultValue)) {
                organisationId = this.defaultValue[0];
            }
        } else if (!contactId && !this.ORGA_DETERMINES_CONTACT && !init) {
            await this.setFormValue(null, true);
        } else if (contactId && !this.ORGA_DETERMINES_CONTACT) {

            // if current value is acceptable - keep it
            if (this.possibleValues?.some((pv) => pv?.toString() === this.value?.toString())) {
                return;
            }

            if (Array.isArray(contactId)) {
                contactId = contactId[0];
            }

            // if contact is an id, get its organisations
            if (!isNaN(Number(contactId))) {
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, [contactId], null, null, true
                ).catch((): Contact[] => []);

                if (contacts.length) {
                    const contact = contacts[0];

                    organisationId = this.possibleValues.some((v) => v === contact.PrimaryOrganisationID) ?
                        contact.PrimaryOrganisationID : null;
                }
            }

            else if (typeof contactId === 'string') {
                // ignore string (unknown contact) value, do nothing
            }
        }

        if (organisationId) {
            const node = this.treeHandler.getTree().find((n) => n.id.toString() === organisationId.toString());
            if (node && !node.selected) {
                this.treeHandler.setSelection([node], true);
            }
            await this.setFormValue(organisationId, true);
        }
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        return this.setFormValueTimeout.start(async () => {
            let newValue;
            if (value) {
                if (Array.isArray(value)) {
                    newValue = value[0];
                } else {
                    newValue = value;
                }
            } else {
                newValue = null;
            }
            await super.setFormValue(newValue, force);
        }, 350);
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

    public async setPossibleValues(): Promise<void> {
        return;
    }

    public async addPossibleValues(): Promise<void> {
        return;
    }

    public async removePossibleValues(): Promise<void> {
        return;
    }
}