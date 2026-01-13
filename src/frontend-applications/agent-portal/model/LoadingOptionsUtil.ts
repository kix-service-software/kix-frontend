/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PlaceholderService } from '../modules/base-components/webapp/core/PlaceholderService';
import { SearchOperator } from '../modules/search/model/SearchOperator';
import { SearchProperty } from '../modules/search/model/SearchProperty';
import { FilterCriteria } from './FilterCriteria';
import { KIXObject } from './kix/KIXObject';
import { KIXObjectLoadingOptions } from './KIXObjectLoadingOptions';

export class LoadingOptionsUtil {

    public static async prepareLoadingOptions(
        contextObject: KIXObject, loadingOptions: KIXObjectLoadingOptions, searchValue?: string
    ): Promise<KIXObjectLoadingOptions> {

        const preparedLoadingOptions = new KIXObjectLoadingOptions(
            [], loadingOptions.sortOrder, loadingOptions.limit, loadingOptions.includes, loadingOptions.expands,
            [], loadingOptions.cacheType, loadingOptions.searchLimit
        );

        if (Array.isArray(loadingOptions.filter)) {
            for (const criterion of loadingOptions.filter) {
                if (typeof criterion.value === 'string' || Array.isArray(criterion.value)) {
                    const preparedCriterion = await this.createFilterCriteria(
                        criterion, contextObject, searchValue
                    );
                    preparedLoadingOptions.filter.push(preparedCriterion);
                } else {
                    preparedLoadingOptions.filter.push(criterion);
                }
            }
        }

        if (Array.isArray(loadingOptions.query)) {
            for (const q of loadingOptions.query) {
                const newQuery: [string, string] = [q[0], ''];
                newQuery[1] = await PlaceholderService.getInstance().replacePlaceholders(q[1], contextObject);
                newQuery[1] = newQuery[1].replace(SearchProperty.SEARCH_VALUE, searchValue);
                preparedLoadingOptions.query.push(newQuery);
            }
        }

        return preparedLoadingOptions;
    }

    private static async replaceCriteriaValuePlaceholder(
        value: string, contextObject: KIXObject, searchValue: string, operator: string
    ): Promise<string> {
        value = await PlaceholderService.getInstance().replacePlaceholders(value?.toString(), contextObject);
        value = value.replace(SearchProperty.SEARCH_VALUE, searchValue);

        if (operator === SearchOperator.LIKE) {
            value = `*${value}*`;
        }

        return value;
    }

    private static async createFilterCriteria(
        criterion: FilterCriteria, contextObject: KIXObject, searchValue: string
    ): Promise<FilterCriteria> {
        const preparedCriterion = new FilterCriteria(
            criterion.property, criterion.operator, criterion.type, criterion.filterType, criterion.value
        );

        if (Array.isArray(criterion.value)) {
            const values = [];
            for (const v of criterion.value) {
                const preparedValue = await this.replaceCriteriaValuePlaceholder(
                    v?.toString(), contextObject, searchValue, criterion.operator
                );
                values.push(preparedValue);
            }
            preparedCriterion.value = values;
        } else if (typeof (criterion.value) === 'string') {
            preparedCriterion.value = await this.replaceCriteriaValuePlaceholder(
                criterion.value?.toString(), contextObject, searchValue, criterion.operator
            );
        }

        return preparedCriterion;
    }

}