/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { TicketProperty } from '../../model/TicketProperty';
import { PropertyOperator } from '../../../../modules/base-components/webapp/core/PropertyOperator';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { SortUtil } from '../../../../model/SortUtil';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { QueueService, TicketService } from '.';
import { BulkManager } from '../../../bulk/webapp/core';
import { UserProperty } from '../../../user/model/UserProperty';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { User } from '../../../user/model/User';
import { Contact } from '../../../customer/model/Contact';
import { Organisation } from '../../../customer/model/Organisation';
export class TicketBulkManager extends BulkManager {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    public reset(notify?: boolean, force: boolean = false): void {
        const skipAddingEmptyValues = super.reset(notify, force);
        if (skipAddingEmptyValues) return;
        this.values.push(new ObjectPropertyValue(TicketProperty.QUEUE_ID, PropertyOperator.CHANGE, null));
        this.values.push(new ObjectPropertyValue(TicketProperty.TYPE_ID, PropertyOperator.CHANGE, null));
        if (notify || typeof notify === 'undefined') {
            this.notifyListeners();
        }
    }

    public async getOperations(property: string): Promise<Array<PropertyOperator | string>> {
        for (const extendedManager of this.extendedFormManager) {
            const result = await extendedManager.getOperations(property);
            if (result) {
                return result;
            }
        }

        const operations: Array<PropertyOperator | string> = [PropertyOperator.CHANGE];

        if (property) {
            switch (property) {
                case TicketProperty.TITLE:
                case TicketProperty.CONTACT_ID:
                case TicketProperty.ORGANISATION_ID:
                case TicketProperty.QUEUE_ID:
                case TicketProperty.OWNER_ID:
                case TicketProperty.RESPONSIBLE_ID:
                case TicketProperty.PRIORITY_ID:
                case TicketProperty.STATE_ID:
                case TicketProperty.TYPE_ID:
                    break;
                default:
                    operations.push(PropertyOperator.CLEAR);
            }
        }

        return operations;
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        let inputFieldType: InputFieldTypes | string = InputFieldTypes.TEXT;
        switch (property) {
            case TicketProperty.CONTACT_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                inputFieldType = InputFieldTypes.OBJECT_REFERENCE;
                break;
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.TYPE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.LOCK_ID:
                inputFieldType = InputFieldTypes.DROPDOWN;
                break;
            case TicketProperty.PENDING_TIME:
                inputFieldType = InputFieldTypes.DATE_TIME;
                break;
            default:
                inputFieldType = await super.getInputType(property);
        }

        return inputFieldType;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        let properties: Array<[string, string]> = [
            [
                TicketProperty.CONTACT_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.CONTACT_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.ORGANISATION_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.ORGANISATION_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.LOCK_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.LOCK_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.OWNER_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.OWNER_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.PRIORITY_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.PRIORITY_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.QUEUE_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.QUEUE_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.RESPONSIBLE_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.RESPONSIBLE_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.STATE_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.STATE_ID, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.PENDING_TIME,
                await LabelService.getInstance().getPropertyText(TicketProperty.PENDING_TIME, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.TITLE,
                await LabelService.getInstance().getPropertyText(TicketProperty.TITLE, KIXObjectType.TICKET)
            ],
            [
                TicketProperty.TYPE_ID,
                await LabelService.getInstance().getPropertyText(TicketProperty.TYPE_ID, KIXObjectType.TICKET)
            ],
        ];

        const superProperties = await super.getProperties();
        properties = [...properties, ...superProperties];

        properties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]));
        return properties;
    }

    public async isHiddenProperty(property: string): Promise<boolean> {
        // hide organisation if no contact is set
        if (property === TicketProperty.ORGANISATION_ID) {
            const contactValue = this.values.find((v) => v.property === TicketProperty.CONTACT_ID);
            return !Boolean(Array.isArray(contactValue?.value) ? contactValue?.value?.length : contactValue?.value);
        }
        return property === TicketProperty.PENDING_TIME;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        switch (property) {
            case TicketProperty.ORGANISATION_ID:
                const organisationValue = this.values.find((bv) => bv.property === TicketProperty.ORGANISATION_ID);
                const contactValue = this.values.find((v) => v.property === TicketProperty.CONTACT_ID);
                if (organisationValue && contactValue) {
                    const contactId = contactValue?.value
                        ? Array.isArray(contactValue.value)
                            ? contactValue.value[0]
                            : contactValue.value
                        : null;
                    if (contactId) {
                        const contacts: Contact[] = await KIXObjectService.loadObjects<Contact>(
                            KIXObjectType.CONTACT, [contactId], undefined, undefined, true
                        ).catch(() => [] as Contact[]);
                        if (contacts?.length) {
                            const orgaIds = Array.isArray(contacts[0].OrganisationIDs)
                                ? contacts[0].OrganisationIDs
                                : contacts[0].PrimaryOrganisationID
                                    ? [contacts[0].PrimaryOrganisationID]
                                    : null;
                            nodes = await this.getOrganisationNodes(orgaIds);
                        }
                        // use set value as node (probably unknown contact/organisation)
                        else if (organisationValue.value) {
                            const orgStringValue = Array.isArray(organisationValue.value)
                                ? organisationValue.value[0].toString() : organisationValue.value.toString();
                            nodes.push(new TreeNode(
                                orgStringValue, orgStringValue,
                                new ObjectIcon(null, KIXObjectType.ORGANISATION, orgStringValue)
                            ));
                        }
                    }
                }
                break;
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(false, null, ['CREATE']);
                nodes = await QueueService.getInstance().prepareObjectTree(queuesHierarchy);
                break;
            default:
                nodes = await TicketService.getInstance().getTreeNodes(property);
                for (const node of nodes) {
                    node.label = await TranslationService.translate(node.label);
                }
        }
        return nodes;
    }

    private async getOrganisationNodes(orgaIds: number[]): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        if (orgaIds) {
            const organisations: Organisation[] = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, orgaIds, undefined, undefined, true
            ).catch(() => []);
            if (organisations?.length) {
                const nodePromises = [];
                organisations.forEach((org) => {
                    nodePromises.push(
                        new Promise(async (resolve) => {
                            const displayValue = await LabelService.getInstance().getObjectText(org);
                            resolve(
                                new TreeNode(
                                    org.ID, displayValue,
                                    new ObjectIcon(null, KIXObjectType.ORGANISATION, org.ID)
                                )
                            );
                        })
                    );
                });
                nodes = await Promise.all(nodePromises);
            }
        }
        return nodes;
    }

    protected async checkProperties(property: string): Promise<void> {
        if (property === TicketProperty.CONTACT_ID) {
            await this.checkContactValue();
        } else if (property === TicketProperty.STATE_ID) {
            await this.checkStateValue();
        } else if (property === TicketProperty.QUEUE_ID) {
            await this.checkOwnerResponsibleValue();
        }
    }

    private async checkContactValue(): Promise<void> {
        const contactValue = this.values.find((bv) => bv.property === TicketProperty.CONTACT_ID);
        if (contactValue) {
            const contactIds = contactValue.value
                ? Array.isArray(contactValue.value)
                    ? contactValue.value :
                    [contactValue.value]
                : null;
            if (contactIds?.length) {
                const organisationValue = this.values.find(
                    (bv) => bv.property === TicketProperty.ORGANISATION_ID
                );
                const contacts = await KIXObjectService.loadObjects<Contact>(
                    KIXObjectType.CONTACT, contactIds, undefined, undefined, true
                ).catch(() => [] as Contact[]);

                // use primary else use fallback for unknown contact/orga (contact value => organisation value)
                let orgId = contacts?.length && contacts[0].PrimaryOrganisationID
                    ? contacts[0].PrimaryOrganisationID : contactIds[0];

                if (organisationValue) {
                    organisationValue.value = this.getOrgValue(organisationValue, contacts) || orgId;
                    // trigger reload of possible values (contact changed, so assigned orgas probably changed, too)
                    organisationValue.reloadValueTree = true;
                } else {
                    const value = new ObjectPropertyValue(
                        TicketProperty.ORGANISATION_ID, PropertyOperator.CHANGE, orgId, [], false, true,
                        null, true, false
                    );
                    value.valueChangeable = true;
                    value.locked = true;
                    const index = this.values.findIndex((bv) => bv.property === TicketProperty.CONTACT_ID);
                    this.values.splice(index + 1, 0, value);
                }
            }
            // no contact set, remove organisation value
            else {
                await this.deleteValue(TicketProperty.ORGANISATION_ID);
            }
        }
        // no contact value, remove organisation value
        else {
            await this.deleteValue(TicketProperty.ORGANISATION_ID);
        }
    }

    private getOrgValue(organisationValue: ObjectPropertyValue, contacts: Contact[]): number {
        const currentValue = Array.isArray(organisationValue.value)
            ? organisationValue.value[0] : organisationValue.value;
        if (currentValue && contacts?.length) {
            // check if current value is still possible
            if (
                (
                    Array.isArray(contacts[0].OrganisationIDs)
                    && contacts[0].OrganisationIDs.some((oid) => oid === currentValue)
                )
                || (contacts[0].PrimaryOrganisationID === currentValue)
            ) {
                return currentValue;
            }
        }
        return;
    }

    private async checkStateValue(): Promise<void> {
        const stateValue = this.values.find((bv) => bv.property === TicketProperty.STATE_ID);
        if (stateValue && stateValue.value) {
            const stateValueForUse = Array.isArray(stateValue.value) ? stateValue.value[0] : stateValue.value;
            const pendingState = stateValueForUse
                ? await TicketService.isPendingState(Number(stateValueForUse))
                : null;

            if (pendingState) {
                const pendingValueIndex = this.values.findIndex((bv) => bv.property === TicketProperty.PENDING_TIME);

                const pendingDate = await TicketService.getPendingDateDiff();
                const value = new ObjectPropertyValue(
                    TicketProperty.PENDING_TIME, PropertyOperator.CHANGE,
                    DateTimeUtil.getKIXDateTimeString(pendingDate),
                    [], false, true, null, true, true
                );
                value.locked = true;
                if (pendingValueIndex === -1) {
                    const index = this.values.findIndex((bv) => bv.property === TicketProperty.STATE_ID);
                    this.values.splice(index + 1, 0, value);
                    this.notifyListeners();
                }
            } else {
                await this.deleteValue(TicketProperty.PENDING_TIME);
            }
        } else {
            await this.deleteValue(TicketProperty.PENDING_TIME);
        }
    }

    private async checkOwnerResponsibleValue(): Promise<void> {
        const ownerValue = this.values.find((bv) => bv.property === TicketProperty.OWNER_ID);
        const responsibleValue = this.values.find((bv) => bv.property === TicketProperty.RESPONSIBLE_ID);
        if (ownerValue?.value || responsibleValue?.value) {
            const loadingOptions = this.setLoadingOptions();
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, undefined, loadingOptions
            ).catch(() => [] as User[]);
            if (ownerValue?.value) {
                const ownerId = Array.isArray(ownerValue.value) ? ownerValue.value[0] : ownerValue?.value;
                if (ownerId && !users.some((u) => u.UserID === ownerId)) {

                    // generate new id ("reset" owner field - possible values in tree component)
                    const newOwnerValue = new ObjectPropertyValue(undefined, undefined, undefined);
                    ownerValue.id = newOwnerValue.id;
                    ownerValue.value = null;
                }
            }
            if (responsibleValue?.value) {
                const responsible = Array.isArray(responsibleValue.value) ? responsibleValue.value[0]
                    : responsibleValue?.value;
                if (responsible && !users.some((u) => u.UserID === responsible)) {

                    // generate new id ("reset" responsible field - possible values in tree component)
                    const newOwnerValue = new ObjectPropertyValue(undefined, undefined, undefined);
                    ownerValue.id = newOwnerValue.id;
                    ownerValue.value = null;
                }
            }
        }
    }

    private async deleteValue(property: string): Promise<void> {
        const value = this.values.find((bv) => bv.property === property);
        if (value) {
            await this.removeValue(value);
        }
    }

    public async validate(): Promise<ValidationResult[]> {
        const validationResult = await super.validate();

        const results = [];
        const pendingValue = this.values.find((v) => v.property === TicketProperty.PENDING_TIME);
        if (pendingValue) {
            if (pendingValue.value) {
                const pendingDate = new Date(pendingValue.value);
                if (isNaN(pendingDate.getTime())) {
                    results.push(
                        new ValidationResult(
                            ValidationSeverity.ERROR, 'Translatable#Pending Time has invalid date!'
                        )
                    );
                } else if (pendingDate < new Date()) {
                    results.push(
                        new ValidationResult(
                            ValidationSeverity.ERROR, 'Translatable#Pending Time has to be in future!'
                        )
                    );
                }
            } else {
                results.push(
                    new ValidationResult(ValidationSeverity.ERROR, 'Translatable#Pending Time is required!')
                );
            }

            pendingValue.valid = !results.some((r) => r.severity === ValidationSeverity.ERROR);
            results.forEach((r) => {
                if (r.severity === ValidationSeverity.ERROR) {
                    pendingValue.validErrorMessages.push(r.message);
                }
            });
        }

        validationResult.push(...results);
        return validationResult;
    }

    public async prepareLoadingOptions(
        value: ObjectPropertyValue, loadingOptions: KIXObjectLoadingOptions
    ): Promise<KIXObjectLoadingOptions> {
        if (value.property === TicketProperty.OWNER_ID || value.property === TicketProperty.RESPONSIBLE_ID) {
            this.setLoadingOptions(loadingOptions);
        }
        return loadingOptions;
    }


    private setLoadingOptions(
        loadingOptions: KIXObjectLoadingOptions = new KIXObjectLoadingOptions()
    ): KIXObjectLoadingOptions {
        if (!Array.isArray(loadingOptions.filter)) {
            loadingOptions.filter = [];
        }
        loadingOptions.filter.push(...[
            new FilterCriteria(
                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, 1
            ),
            new FilterCriteria(
                UserProperty.IS_AGENT, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, 1
            )
        ]);

        const queueValue = this.getValues()?.find((v) => v.property === TicketProperty.QUEUE_ID);

        const queueId = queueValue?.value
            ? Array.isArray(queueValue.value)
                ? queueValue.value[0]
                : queueValue.value
            : null;

        const requiredPermission = {
            Object: KIXObjectType.QUEUE,
            ObjectID: queueId,
            Permission: 'WRITE,READ'
        };

        const query: [string, string][] = [
            ['requiredPermission', JSON.stringify(requiredPermission)]
        ];

        loadingOptions.query = query;

        return loadingOptions;
    }
}
