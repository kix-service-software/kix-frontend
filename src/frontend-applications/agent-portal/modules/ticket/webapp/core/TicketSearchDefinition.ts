/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchDefinition } from '../../../search/webapp/core/SearchDefinition';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TicketSearchFormManager } from './TicketSearchFormManager';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { TicketProperty } from '../../model/TicketProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { SearchFormManager } from '../../../base-components/webapp/core/SearchFormManager';
import { Ticket } from '../../model/Ticket';
import { IColumnConfiguration } from '../../../../model/configuration/IColumnConfiguration';
import { ArticleProperty } from '../../model/ArticleProperty';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';

export class TicketSearchDefinition extends SearchDefinition {

    public constructor() {
        super(KIXObjectType.TICKET);
        this.formManager = new TicketSearchFormManager();
    }

    public createFormManager(
        ignoreProperties: string[] = [], validDynamicFields: boolean = true
    ): SearchFormManager {
        const formManager = new TicketSearchFormManager(ignoreProperties, validDynamicFields);
        formManager.init = (): void => {

            // get extended managers on init because they could be added after filterManager was created
            if (this.formManager) {
                formManager['extendedFormManager'] = [];
                this.formManager.getExtendedFormManager().forEach(
                    (m) => formManager.addExtendedFormManager(m)
                );
            }
        };
        return formManager;
    }

    public async prepareFormFilterCriteria(
        criteria: FilterCriteria[], forSearch: boolean = true, allowEmptyValue?: boolean
    ): Promise<FilterCriteria[]> {
        criteria = await super.prepareFormFilterCriteria(criteria, forSearch, allowEmptyValue);
        const fulltextCriteriaIndex = criteria.findIndex((c) => c.property === SearchProperty.FULLTEXT);
        if (fulltextCriteriaIndex !== -1) {
            const value = criteria[fulltextCriteriaIndex].value;
            criteria.splice(fulltextCriteriaIndex, 1);

            criteria = [...criteria, ...this.getFulltextCriteria(value as string)];
        }

        const lockIndex = criteria.findIndex((c) => c.property === TicketProperty.LOCK_ID);
        if (lockIndex !== -1 && criteria[lockIndex].value && Array.isArray(criteria[lockIndex].value)) {
            criteria[lockIndex].value = criteria[lockIndex].value[0];
        }

        return criteria;
    }

    public appendFullTextCriteria(criteria: FilterCriteria[]): void {
        const hasStateType = criteria.some((c) => c.property === TicketProperty.STATE_TYPE);
        if (!hasStateType) {
            criteria.push(
                new FilterCriteria(
                    TicketProperty.STATE_TYPE, SearchOperator.IN,
                    FilterDataType.STRING, FilterType.AND, ['Open']
                )
            );
        }
    }

    public async prepareSearchFormValue(property: string, value: any): Promise<FilterCriteria[]> {
        let criteria = [];
        switch (property) {
            case TicketProperty.TICKET_NUMBER:
            case TicketProperty.TITLE:
                criteria = [
                    ...criteria,
                    new FilterCriteria(property, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.AND, value)
                ];
                break;
            case SearchProperty.FULLTEXT:
                criteria = [...criteria, ...this.getFulltextCriteria(value)];
                break;
            default:
                const preparedCriteria = await super.prepareSearchFormValue(property, value);
                criteria = [...criteria, ...preparedCriteria];
        }

        return criteria;
    }

    private getFulltextCriteria(value: string): FilterCriteria[] {
        const criteria: FilterCriteria[] = [];
        if (value) {
            criteria.push(new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.LIKE, FilterDataType.STRING, FilterType.AND, value
            ));
        }
        return criteria;

    }

    public getFilterCriteria(searchValue: ObjectPropertyValue): FilterCriteria {
        const criteria = super.getFilterCriteria(searchValue);

        const searchProperty = Ticket.SEARCH_PROPERTIES.find((p) => p.Property === searchValue.property);
        if (searchProperty) {
            criteria.type = searchProperty.DataType;
        } else {
            if (criteria.property === TicketProperty.CREATED
                || criteria.property === TicketProperty.CHANGED
            ) {
                criteria.type = FilterDataType.DATETIME;
            }
        }

        return criteria;
    }

    public async getTableColumnConfiguration(searchParameter: Array<[string, any]>): Promise<IColumnConfiguration[]> {
        const ignoreParameter = [
            TicketProperty.CLOSE_TIME,
            TicketProperty.CREATED_PRIORITY_ID, TicketProperty.CREATED_QUEUE_ID, TicketProperty.CREATED_TYPE_ID,
            TicketProperty.CREATED_USER_ID, TicketProperty.CREATED_STATE_ID, TicketProperty.ARTICLE_CREATE_TIME,
            TicketProperty.ATTACHMENT_NAME, TicketProperty.WATCHER_USER_ID,
            TicketProperty.STATE_TYPE, TicketProperty.LAST_CHANGE_TIME,
            TicketProperty.MY_QUEUES
        ];
        const articleDFParameter = await this.getArticleDFParameter(searchParameter);

        searchParameter = searchParameter.filter(
            (sp) =>
                !ignoreParameter.some((ip) => ip === sp[0])
                && !this.isArticleProperty(sp[0])
                && !articleDFParameter.some((dfp) => dfp === sp[0])
        );

        const columns: IColumnConfiguration[] = await super.getTableColumnConfiguration(searchParameter);
        if (columns) {
            for (const column of columns) {
                switch (column.property) {
                    case TicketProperty.CREATE_TIME:
                        column.property = TicketProperty.CREATED;
                        break;
                    case TicketProperty.CHANGE_TIME:
                        column.property = TicketProperty.CHANGED;
                        break;
                    default:
                }
            }
        }
        return columns;
    }

    private async getArticleDFParameter(searchParameter: [string, any][]): Promise<string[]> {
        const articleDfPromises = [];
        searchParameter.forEach((sp) => {
            articleDfPromises.push(
                new Promise<string | void>(async (resolve) => {
                    const dfName = KIXObjectService.getDynamicFieldName(sp[0]);
                    if (dfName) {
                        const df = await KIXObjectService.loadDynamicField(dfName);
                        if (df.ObjectType === KIXObjectType.ARTICLE) {
                            resolve(sp[0]);
                        }
                    }
                    resolve();
                })
            );
        });
        return (await Promise.all(articleDfPromises)).filter((dfParameter) => dfParameter);
    }

    private isArticleProperty(property: string): boolean {
        const articleProperty = Object.keys(ArticleProperty).map((p) => ArticleProperty[p]);
        return articleProperty.some((p) => p === property);
    }

    public getDefaultSearchCriteria(): string[] {
        return [SearchProperty.FULLTEXT, TicketProperty.TITLE, TicketProperty.QUEUE_ID, TicketProperty.STATE_TYPE];
    }
}
