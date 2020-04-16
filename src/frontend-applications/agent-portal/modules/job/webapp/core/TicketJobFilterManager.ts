/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable:max-line-length
import { AbstractDynamicFormManager } from "../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { DynamicFormOperationsType } from "../../../base-components/webapp/core/dynamic-form/DynamicFormOperationsType";
import { TicketProperty } from "../../../ticket/model/TicketProperty";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { ContextType } from "../../../../model/ContextType";
import { JobProperty } from "../../model/JobProperty";
import { JobService } from ".";
import { ArticleProperty } from "../../../ticket/model/ArticleProperty";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { InputFieldTypes } from "../../../../modules/base-components/webapp/core/InputFieldTypes";
import { TreeNode } from "../../../base-components/webapp/core/tree";
import { TicketService } from "../../../ticket/webapp/core";
import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { Organisation } from "../../../customer/model/Organisation";
import { Contact } from "../../../customer/model/Contact";
import { ObjectPropertyValue } from "../../../../model/ObjectPropertyValue";
import { DynamicField } from "../../../dynamic-fields/model/DynamicField";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { FilterCriteria } from "../../../../model/FilterCriteria";
import { DynamicFieldProperty } from "../../../dynamic-fields/model/DynamicFieldProperty";
import { SearchOperator } from "../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../model/FilterDataType";
import { FilterType } from "../../../../model/FilterType";
import { DynamicFieldTypes } from "../../../dynamic-fields/model/DynamicFieldTypes";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { SortUtil } from "../../../../model/SortUtil";
import { CMDBService } from "../../../cmdb/webapp/core";
// tslint:enable

export class TicketJobFilterManager extends AbstractDynamicFormManager {

    private static INSTANCE: TicketJobFilterManager;

    public static getInstance(): TicketJobFilterManager {
        if (!TicketJobFilterManager.INSTANCE) {
            TicketJobFilterManager.INSTANCE = new TicketJobFilterManager();
        }
        return TicketJobFilterManager.INSTANCE;
    }

    private constructor() {
        super();
    }

    public objectType: KIXObjectType = KIXObjectType.JOB;

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.NONE;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const fixedProperties = [];

        const ticketProperties = [
            TicketProperty.TYPE_ID, TicketProperty.STATE_ID, TicketProperty.PRIORITY_ID,
            TicketProperty.QUEUE_ID, TicketProperty.LOCK_ID, TicketProperty.ORGANISATION_ID,
            TicketProperty.CONTACT_ID, TicketProperty.OWNER_ID, TicketProperty.RESPONSIBLE_ID
        ];

        let selectedEvents = [];
        let hasArticleEvent = true;
        const context = ContextService.getInstance().getActiveContext();
        if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
            selectedEvents = context.getAdditionalInformation(JobProperty.EXEC_PLAN_EVENTS);
            hasArticleEvent = selectedEvents
                ? await JobService.getInstance().hasArticleEvent(selectedEvents)
                : false;
        }

        const articleProperties = hasArticleEvent
            ? [
                ArticleProperty.SENDER_TYPE_ID, ArticleProperty.CHANNEL_ID,
                ArticleProperty.TO, ArticleProperty.CC, ArticleProperty.FROM,
                ArticleProperty.SUBJECT, ArticleProperty.BODY
            ]
            : [];

        for (const ticketProperty of ticketProperties) {
            const label = await LabelService.getInstance().getPropertyText(ticketProperty, KIXObjectType.TICKET);
            fixedProperties.push([ticketProperty, label]);
        }

        for (const articleProperty of articleProperties) {
            const label = await LabelService.getInstance().getPropertyText(articleProperty, KIXObjectType.ARTICLE);
            fixedProperties.push([articleProperty, label]);
        }

        const dynamicPoperties = [];
        if (await this.checkReadPermissions('system/dynamicfields')) {
            let validDFTypes = [];
            this.extendedFormManager.forEach((m) => validDFTypes = [...validDFTypes, ...m.getValidDFTypes()]);

            const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
                KIXObjectType.DYNAMIC_FIELD, null,
                new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            DynamicFieldProperty.OBJECT_TYPE, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, KIXObjectType.TICKET
                        ),
                        new FilterCriteria(
                            DynamicFieldProperty.FIELD_TYPE, SearchOperator.IN,
                            FilterDataType.STRING, FilterType.AND,
                            [
                                DynamicFieldTypes.TEXT,
                                DynamicFieldTypes.TEXT_AREA,
                                DynamicFieldTypes.DATE,
                                DynamicFieldTypes.DATE_TIME,
                                DynamicFieldTypes.SELECTION,
                                DynamicFieldTypes.CI_REFERENCE,
                                ...validDFTypes
                            ]
                        )
                    ]
                ), null, true
            ).catch(() => [] as DynamicField[]);
            if (dynamicFields && dynamicFields.length) {
                for (const df of dynamicFields) {
                    const label = await TranslationService.translate(df.Label);
                    dynamicPoperties.push([`${KIXObjectProperty.DYNAMIC_FIELDS}.${df.Name}`, label]);
                }
            }
        }

        return [
            ...fixedProperties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1])),
            ...dynamicPoperties.sort((a1, a2) => SortUtil.compareString(a1[1], a2[1]))
        ];
    }

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        switch (property) {
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.QUEUE_ID:
            case TicketProperty.LOCK_ID:
            case TicketProperty.SERVICE:
            case TicketProperty.SLA:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case ArticleProperty.SENDER_TYPE_ID:
            case ArticleProperty.CHANNEL_ID:
                return InputFieldTypes.DROPDOWN;
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.CONTACT_ID:
                return InputFieldTypes.OBJECT_REFERENCE;
            default:
                const inputType = super.getInputType(property);
                return inputType ? inputType : InputFieldTypes.TEXT;
        }
    }

    public async getObjectReferenceObjectType(property: string): Promise<KIXObjectType | string> {
        switch (property) {
            case TicketProperty.ORGANISATION_ID:
                return KIXObjectType.ORGANISATION;
            case TicketProperty.CONTACT_ID:
                return KIXObjectType.CONTACT;
            default:
                return super.getObjectReferenceObjectType(property);
        }
    }

    public async getTreeNodes(property: string, objectIds?: any): Promise<TreeNode[]> {
        let nodes = [];
        switch (property) {
            case TicketProperty.TYPE_ID:
            case TicketProperty.STATE_ID:
            case TicketProperty.PRIORITY_ID:
            case TicketProperty.SERVICE:
            case TicketProperty.SLA:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.LOCK_ID:
            case ArticleProperty.SENDER_TYPE_ID:
            case ArticleProperty.CHANNEL_ID:
                nodes = await TicketService.getInstance().getTreeNodes(property, true, true);
                break;
            case TicketProperty.QUEUE_ID:
                nodes = await TicketService.getInstance().getTreeNodes(property, true, true);
                break;
            case TicketProperty.ORGANISATION_ID:
                if (Array.isArray(objectIds) && !!objectIds.length) {
                    const organisations = await KIXObjectService.loadObjects<Organisation>(
                        KIXObjectType.ORGANISATION, objectIds
                    );
                    nodes = await KIXObjectService.prepareTree(organisations);
                }
                break;
            case TicketProperty.CONTACT_ID:
                if (Array.isArray(objectIds) && !!objectIds.length) {
                    const contacts = await KIXObjectService.loadObjects<Contact>(
                        KIXObjectType.CONTACT, objectIds
                    );
                    nodes = await KIXObjectService.prepareTree(contacts);
                }
                break;
            default:
                nodes = await TicketService.getInstance().getTreeNodes(property, true, true, objectIds);
        }
        return nodes;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return typeof value.property !== 'undefined' && value.property !== null;
    }

    public async isMultiselect(property: string): Promise<boolean> {
        return true;
    }

    public async searchValues(property: string, searchValue: string, limit: number): Promise<TreeNode[]> {
        const result = await super.searchValues(property, searchValue, limit);
        if (result) {
            return result;
        }

        let tree: TreeNode[];

        switch (property) {
            case TicketProperty.CONTACT_ID:
                const contacts = await KIXObjectService.search(KIXObjectType.CONTACT, searchValue, limit);
                tree = await KIXObjectService.prepareTree(contacts);
                break;
            case TicketProperty.ORGANISATION_ID:
                const organisations = await KIXObjectService.search(KIXObjectType.ORGANISATION, searchValue, limit);
                tree = await KIXObjectService.prepareTree(organisations);
                break;
            default:
        }

        if (!tree && CMDBService) {
            const dfName = KIXObjectService.getDynamicFieldName(property);
            if (dfName) {
                const dynamicField = await KIXObjectService.loadDynamicField(dfName);
                if (dynamicField.FieldType === DynamicFieldTypes.CI_REFERENCE) {
                    const configItems = await CMDBService.searchConfigItems(searchValue, limit);
                    tree = configItems.map(
                        (ci) => new TreeNode(
                            ci.ConfigItemID, ci.Name, 'kix-icon-ci'
                        )
                    );
                }
            }
        }

        return tree;
    }

}
