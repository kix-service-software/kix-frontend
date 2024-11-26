/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TicketService } from './TicketService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { TicketProperty } from '../../model/TicketProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchDefinition, SearchOperatorUtil } from '../../../search/webapp/core';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ContextType } from '../../../../model/ContextType';
import { ContextMode } from '../../../../model/ContextMode';
import { QueueService } from './admin';
import { QueueProperty } from '../../model/QueueProperty';
import { Ticket } from '../../model/Ticket';
import { ArticleProperty } from '../../model/ArticleProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';

export class TicketSearchFormManager extends SearchFormManager {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    // mark viewable states as required
    public handleViewableStateType: boolean = true;

    public constructor(
        public ignorePropertiesFixed: string[] = [],
        private validDynamicFields: boolean = true
    ) {
        super();
        this.additionalObjectTypes.push(KIXObjectType.ARTICLE);
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        let properties: Array<[string, string]> = [
            [SearchProperty.FULLTEXT, null],
            [KIXObjectProperty.CREATE_BY, null],
            [KIXObjectProperty.CHANGE_BY, null]
        ];

        for (const prop of Ticket.SEARCH_PROPERTIES) {
            properties.push([prop.Property, null]);
        }

        const context = ContextService.getInstance().getActiveContext();
        const isDialogContext = context.descriptor.contextType === ContextType.DIALOG;
        const isSearchMode = context.descriptor.contextMode === ContextMode.SEARCH;
        if (context && isDialogContext && !isSearchMode) {
            properties.push(['Queue.FollowUpID', null]);
        }

        for (const p of properties) {
            const label = await LabelService.getInstance().getPropertyText(
                p[0], KIXObjectType.TICKET
            );
            p[1] = label;
        }

        const superProperties = await super.getProperties(this.validDynamicFields);
        properties = [...properties, ...superProperties];

        properties = properties.filter(
            (p) => !this.ignorePropertiesFixed.some((ip) => ip === p[0])
                && !this.ignoreProperties.some((ip) => ip === p[0])
        );

        return properties.sort((a, b) => a[1].localeCompare(b[1]));
    }

    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        let operations: Array<string | SearchOperator> = [];

        const searchProperty = Ticket.SEARCH_PROPERTIES.find((p) => p.Property === property);
        if (searchProperty) {
            operations = searchProperty.Operations;
        } else {
            switch (property) {
                case KIXObjectProperty.CREATE_BY:
                case KIXObjectProperty.CHANGE_BY:
                    operations = [SearchOperator.IN];
                    break;
                case 'Queue.FollowUpID':
                    operations = [SearchOperator.EQUALS];
                    break;
                case TicketProperty.CREATED:
                case TicketProperty.CHANGED:
                    operations = SearchDefinition.getDateTimeOperators();
                    break;
                case SearchProperty.FULLTEXT:
                    operations = [SearchOperator.LIKE];
                    break;
                default:
                    operations = await super.getOperations(property);
            }
        }

        return operations;
    }

    public async getInputType(property: string, operator?: SearchOperator): Promise<InputFieldTypes | string> {
        let inputType: InputFieldTypes | string;
        const searchProperty = Ticket.SEARCH_PROPERTIES.find((p) => p.Property === property);

        if (searchProperty) {
            inputType = searchProperty.InputType;
        } else if (this.isDropDown(property)) {
            inputType = InputFieldTypes.DROPDOWN;
        } else if (this.isDateTime(property)) {
            inputType = InputFieldTypes.DATE_TIME;
        } else {
            inputType = await super.getInputType(property);
        }

        return inputType;
    }

    private isDropDown(property: string): boolean {
        return Ticket.SEARCH_PROPERTIES.some((p) => p.Property === property && p.InputType === InputFieldTypes.DROPDOWN)
            || property === TicketProperty.STATE_TYPE
            || property === 'Queue.FollowUpID';
    }

    private isDateTime(property: string): boolean {
        return property === TicketProperty.CREATED;
    }

    public getOperatorDisplayText(operator: string): Promise<string> {
        return SearchOperatorUtil.getText(operator as SearchOperator);
    }

    public async isMultiselect(property: string, operator: SearchOperator | string): Promise<boolean> {
        const result = await super.isMultiselect(property, operator, true);
        if (result !== null && typeof result !== 'undefined') {
            return result;
        }

        if (
            property === TicketProperty.LOCK_ID
            || property === 'Queue.FollowUpID'
            || property === ArticleProperty.CUSTOMER_VISIBLE
            || property === TicketProperty.OWNER_OOO
            || property === TicketProperty.RESPONSIBLE_OOO
            || property === TicketProperty.MY_QUEUES
        ) {
            return false;
        }
        return true;
    }

    public async getTreeNodes(property: string, objectIds?: Array<string | number>): Promise<TreeNode[]> {
        let nodes = [];
        switch (property) {
            case TicketProperty.CONTACT_ID:
                if (objectIds) {
                    const contacts = await KIXObjectService.loadObjects(KIXObjectType.CONTACT, objectIds);
                    nodes = await KIXObjectService.prepareTree(contacts);
                }
                break;
            case TicketProperty.ORGANISATION_ID:
                if (objectIds) {
                    const organisations = await KIXObjectService.loadObjects(
                        KIXObjectType.ORGANISATION, objectIds
                    );
                    nodes = await KIXObjectService.prepareTree(organisations);
                }
                break;
            case TicketProperty.OWNER_OOO:
            case TicketProperty.MY_QUEUES:
            case TicketProperty.RESPONSIBLE_OOO:
            case ArticleProperty.CUSTOMER_VISIBLE:
                const no = await TranslationService.translate('No');
                const yes = await TranslationService.translate('Yes');
                nodes = [
                    new TreeNode(0, no),
                    new TreeNode(1, yes)
                ];
                break;
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(false, null, ['READ']);
                nodes = await QueueService.getInstance().prepareObjectTree(queuesHierarchy, true, true);
                break;
            default:
                nodes = await super.getTreeNodes(property);
                if (!nodes || !nodes.length) {
                    if (property === 'Queue.FollowUpID') {
                        nodes = await QueueService.getInstance().getTreeNodes(
                            QueueProperty.FOLLOW_UP_ID, true, true, objectIds
                        );
                    } else {
                        nodes = await TicketService.getInstance().getTreeNodes(property, true, true, objectIds);
                    }
                }
        }
        return nodes;
    }

    public async getInputTypeOptions(property: string, operator: string): Promise<Array<[string, any]>> {
        const options = await super.getInputTypeOptions(property, operator);
        const freeTextProperties = [
            TicketProperty.OWNER_ID,
            TicketProperty.RESPONSIBLE_ID,
            TicketProperty.CONTACT_ID,
            TicketProperty.ORGANISATION_ID,
            TicketProperty.CHANGED,
            KIXObjectProperty.CHANGE_BY,
            TicketProperty.CREATED,
            KIXObjectProperty.CREATE_BY
        ];

        if (freeTextProperties.some((p) => p === property)) {
            options.push([ObjectReferenceOptions.FREETEXT, true]);
        }

        return options;
    }

    public async setValue(newValue: ObjectPropertyValue, silent?: boolean): Promise<void> {
        if (newValue.property === TicketProperty.STATE_TYPE && this.handleViewableStateType) {

            const stateValue = this.values.find((v) => v.property === TicketProperty.STATE_ID);
            if (!stateValue) {
                newValue.readonly = false;
                newValue.required = false;
                newValue.changeable = false;
                if (!newValue.value) {
                    newValue.value = ['Open'];
                }
            }
        }

        await super.setValue(newValue, silent);
    }
}
