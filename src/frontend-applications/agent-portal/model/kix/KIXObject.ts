/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from './KIXObjectType';
import { ConfiguredPermissions } from '../ConfiguredPermissions';
import { Link } from '../../modules/links/model/Link';
import { DynamicFieldValue } from '../../modules/dynamic-fields/model/DynamicFieldValue';
import { SearchOperator } from '../../modules/search/model/SearchOperator';

export abstract class KIXObject {

    public displayValues: Array<[string, string]>;

    public abstract ObjectId: string | number;

    public abstract KIXObjectType: KIXObjectType | string;

    public ConfiguredPermissions: ConfiguredPermissions;

    public Links: Link[];

    public LinkTypeName: string;

    public ChangeBy: number;

    public ChangeTime: string;

    public CreateBy: number;

    public CreateTime: string;

    public ValidID: number;

    public Comment: string;

    public DynamicFields: DynamicFieldValue[];

    public constructor(object?: KIXObject) {
        this.displayValues = [];
        if (object) {
            for (const key in object) {
                if (typeof object[key] !== 'undefined') {
                    this[key] = object[key];
                }
            }

            this.displayValues = object.displayValues ? object.displayValues : [];
            this.DynamicFields = object.DynamicFields
                ? object.DynamicFields.map((df) => new DynamicFieldValue(df))
                : [];
        }
    }

    public equals(object: KIXObject): boolean {
        return this.ObjectId === object.ObjectId;
    }

    public getIdPropertyName(): string {
        return 'ID';
    }

    protected prepareObjectFilter(preparedFilter: any[], filter: any) {
        // prepare the filter and handle BETWEEN and relative time operators

        if (filter.Operator === SearchOperator.GREATER_THAN_OR_EQUAL ||
            filter.Operator === SearchOperator.LESS_THAN_OR_EQUAL ||
            (typeof filter.Value === 'string' && filter.Value.match(/^[+-]\d+\w+$/))) {
            // we have to handle this

            if (!filter.Value.match(/^[+-]\d+\w+$/)) {
                // this is a BETWEEN
                const propertyFilter = preparedFilter.find(
                    (f) => f.Field === filter.Field
                        && f.Operator === (filter.Operator === SearchOperator.LESS_THAN_OR_EQUAL) ?
                        SearchOperator.GREATER_THAN_OR_EQUAL : SearchOperator.LESS_THAN_OR_EQUAL
                );
                if (propertyFilter) {
                    propertyFilter.Operator = SearchOperator.BETWEEN;
                    propertyFilter.Value = [
                        propertyFilter.Value,
                        filter.Value,
                    ];
                }
            }
            else {
                const firstChar = filter.Value.charAt(0);
                filter.Value = filter.Value.substring(1);

                if (firstChar === '+' && filter.Value === '0s' &&
                    (filter.Operator === SearchOperator.GREATER_THAN_OR_EQUAL ||
                        filter.Operator === SearchOperator.LESS_THAN_OR_EQUAL))
                    return; // ignore this part
                if (firstChar === '-' && filter.Operator === SearchOperator.GREATER_THAN_OR_EQUAL)
                    filter.Operator = SearchOperator.WITHIN_THE_LAST;
                if (firstChar === '+' && filter.Operator === SearchOperator.LESS_THAN_OR_EQUAL)
                    filter.Operator = SearchOperator.WITHIN_THE_NEXT;
                else if (firstChar === '-' && filter.Operator === SearchOperator.GREATER_THAN)
                    filter.Operator = SearchOperator.LESS_THAN_AGO;
                else if (firstChar === '-' && filter.Operator === SearchOperator.LESS_THAN)
                    filter.Operator = SearchOperator.MORE_THAN_AGO;
                else if (firstChar === '+' && filter.Operator === SearchOperator.LESS_THAN)
                    filter.Operator = SearchOperator.IN_LESS_THAN;
                else if (firstChar === '+' && filter.Operator === SearchOperator.GREATER_THAN)
                    filter.Operator = SearchOperator.IN_MORE_THAN;

                preparedFilter.push(filter);
            }
        } else {
            // just add it unhandled
            preparedFilter.push(filter);
        }
    }
}
