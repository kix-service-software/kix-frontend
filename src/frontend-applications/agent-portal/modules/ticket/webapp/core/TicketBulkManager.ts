/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { ValidationResult } from '../../../base-components/webapp/core/ValidationResult';
import { ValidationSeverity } from '../../../base-components/webapp/core/ValidationSeverity';

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

    public async getOperations(property: string): Promise<PropertyOperator[]> {
        const operations = [PropertyOperator.CHANGE];

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
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                inputFieldType = InputFieldTypes.OBJECT_REFERENCE;
                break;
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

    public async getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        const options = await super.getInputTypeOptions(property, operator);

        if (property === TicketProperty.OWNER_ID || property === TicketProperty.RESPONSIBLE_ID) {
            const loadingOptions = new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                        FilterType.AND, 1
                    ),
                    new FilterCriteria(
                        UserProperty.USAGE_CONTEXT, SearchOperator.IN, FilterDataType.NUMERIC,
                        FilterType.AND, [1, 3]
                    )
                ]
            );
            options.push([ObjectReferenceOptions.LOADINGOPTIONS, loadingOptions]);
        }

        return options;
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
        return property === TicketProperty.ORGANISATION_ID || property === TicketProperty.PENDING_TIME;
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        switch (property) {
            case TicketProperty.ORGANISATION_ID:
                const organisationValue = this.values.find((bv) => bv.property === TicketProperty.ORGANISATION_ID);
                if (organisationValue) {
                    const organisations = await KIXObjectService.loadObjects(
                        KIXObjectType.ORGANISATION,
                        Array.isArray(organisationValue.value) ? organisationValue.value : [organisationValue.value],
                        undefined, undefined, true
                    ).catch(() => []);
                    if (organisations && !!organisations.length) {
                        const displayValue = await LabelService.getInstance().getObjectText(organisations[0]);
                        nodes.push(new TreeNode(
                            organisations[0].ID, displayValue,
                            new ObjectIcon(null, KIXObjectType.ORGANISATION, organisations[0].ID)
                        ));
                    } else {
                        const orgStringValue = Array.isArray(organisationValue.value)
                            ? organisationValue.value[0].toString() : organisationValue.value.toString();
                        nodes.push(new TreeNode(
                            orgStringValue, orgStringValue,
                            new ObjectIcon(null, KIXObjectType.ORGANISATION, orgStringValue)
                        ));
                    }
                }
                break;
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                const loadingOptions = new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        ),
                        new FilterCriteria(
                            UserProperty.IS_AGENT, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                            FilterType.AND, 1
                        )
                    ], undefined, undefined, undefined, undefined
                );
                nodes = await TicketService.getInstance().getTreeNodes(
                    property, false, false, undefined, loadingOptions
                );
                break;
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(false, null, ['WRITE']);
                nodes = await QueueService.getInstance().prepareObjectTree(queuesHierarchy);
                break;
            default:
                nodes = await TicketService.getInstance().getTreeNodes(property);
        }
        return nodes;
    }

    protected async checkProperties(): Promise<void> {
        await this.checkContactValue();
        await this.checkStateValue();
    }

    private async checkContactValue(): Promise<void> {
        const contactValue = this.values.find((bv) => bv.property === TicketProperty.CONTACT_ID);
        if (contactValue) {
            contactValue.objectType = KIXObjectType.CONTACT;
            const contactValueForUse = !contactValue.value ? null
                : Array.isArray(contactValue.value) ? contactValue.value : [contactValue.value];
            if (contactValueForUse && !!contactValueForUse.length) {
                const contacts = await KIXObjectService.loadObjects(
                    KIXObjectType.CONTACT, contactValueForUse, undefined, undefined, true
                ).catch(() => []);
                let orgId = contactValueForUse[0];
                if (contacts && !!contacts.length) {
                    orgId = contacts[0].PrimaryOrganisationID;
                }
                const value = new ObjectPropertyValue(
                    TicketProperty.ORGANISATION_ID, PropertyOperator.CHANGE, orgId, [], false, true,
                    KIXObjectType.ORGANISATION, true, false
                );
                const organisationValueIndex = this.values.findIndex(
                    (bv) => bv.property === TicketProperty.ORGANISATION_ID
                );
                if (organisationValueIndex === -1) {
                    const index = this.values.findIndex(
                        (bv) => bv.property === TicketProperty.CONTACT_ID
                    );
                    this.values.splice(index + 1, 0, value);
                } else {
                    this.values[organisationValueIndex].value = value.value;
                }
            } else {
                await this.deleteValue(TicketProperty.ORGANISATION_ID);
            }
        } else {
            await this.deleteValue(TicketProperty.ORGANISATION_ID);
        }
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
                if (pendingValueIndex === -1) {
                    const index = this.values.findIndex((bv) => bv.property === TicketProperty.STATE_ID);
                    this.values.splice(index + 1, 0, value);
                }
            } else {
                await this.deleteValue(TicketProperty.PENDING_TIME);
            }
        } else {
            await this.deleteValue(TicketProperty.PENDING_TIME);
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
        if (value.property === TicketProperty.OWNER_ID || TicketProperty.RESPONSIBLE_ID) {

            const queueValue = this.getValues()?.find((v) => v.property === TicketProperty.QUEUE_ID);
            if (queueValue) {
                const queueId = Array.isArray(queueValue.value)
                    ? queueValue.value[0]
                    : queueValue.value;

                const requiredPermission = {
                    Object: KIXObjectType.QUEUE,
                    ObjectID: queueId,
                    Permission: 'WRITE,READ'
                };

                const query: [string, string][] = [
                    ['requiredPermission', JSON.stringify(requiredPermission)]
                ];

                loadingOptions.query = query;
            } else {
                loadingOptions.query = [];
            }
        }
        return loadingOptions;
    }

}
