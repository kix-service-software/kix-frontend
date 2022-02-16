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
import { ObjectIcon } from '../../modules/icon/model/ObjectIcon';
import { SortUtil } from '../SortUtil';

export abstract class KIXObject {

    public displayValues: Array<[string, string]>;
    public displayIcons: Array<[string, Array<ObjectIcon | string>]>;

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
        this.displayIcons = [];
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

    public getDisplayValue(property: string): string {
        let displayValue: string;
        const value = this.displayValues.find((dv) => dv[0] === property);
        if (Array.isArray(value)) {
            displayValue = value[1];
        }

        return displayValue;
    }

    public getDisplayIcons(property: string): Array<ObjectIcon | string> {
        let displayIcons: Array<ObjectIcon | string>;
        const value = this.displayIcons.find((dv) => dv[0] === property);
        if (Array.isArray(value)) {
            displayIcons = value[1];
        }

        return displayIcons;
    }

    protected handleBetweenValueOnLTE(preparedFilter: any[], filter: any): void {
        const propertyFilter = preparedFilter.find(
            (f) => f.Field === filter.Field
                && f.Operator === SearchOperator.GREATER_THAN_OR_EQUAL
        );
        if (propertyFilter) {
            propertyFilter.Operator = SearchOperator.BETWEEN;
            propertyFilter.Value = [
                propertyFilter.Value,
                filter.Value,
            ];
        } else {
            preparedFilter.push(filter);
        }
    }

    protected handleBetweenValueOnGTE(preparedFilter: any[], filter: any): void {
        const propertyFilter = preparedFilter.find(
            (f) => f.Field === filter.Field && f.Operator === SearchOperator.LESS_THAN_OR_EQUAL
        );
        if (propertyFilter) {
            propertyFilter.Operator = SearchOperator.BETWEEN;
            propertyFilter.Value = [
                filter.Value,
                propertyFilter.Value
            ];
        } else {
            // just add it unhandled
            preparedFilter.push(filter);
        }
    }

    protected prepareObjectFilter(preparedFilter: any[], filter: any): void {
        // prepare the filter and handle BETWEEN and relative time operators

        const isGTLTOrEqual = filter.Operator === SearchOperator.GREATER_THAN_OR_EQUAL ||
            filter.Operator === SearchOperator.LESS_THAN_OR_EQUAL;
        const isTimeValue = typeof filter.Value === 'string' && filter.Value.match(/^[+-]\d+\w+$/);

        if (isGTLTOrEqual || isTimeValue) {
            // we have to handle this

            if (filter.Value.match(/^[+-]\d+\w+$/)) {
                const firstChar = filter.Value.charAt(0);
                filter.Value = filter.Value.substring(1);

                const isPlus = firstChar === '+';
                const isMinus = firstChar === '-';

                if (isMinus) {
                    if (isMinus && filter.Value === '0s' && isGTLTOrEqual) {
                        return; // ignore this part
                    }

                    if (filter.Operator === SearchOperator.GREATER_THAN_OR_EQUAL) {
                        filter.Operator = SearchOperator.WITHIN_THE_LAST;
                    } else if (filter.Operator === SearchOperator.GREATER_THAN) {
                        filter.Operator = SearchOperator.LESS_THAN_AGO;
                    } else if (filter.Operator === SearchOperator.LESS_THAN) {
                        filter.Operator = SearchOperator.MORE_THAN_AGO;
                    }
                } else if (isPlus) {
                    if (filter.Operator === SearchOperator.LESS_THAN_OR_EQUAL) {
                        filter.Operator = SearchOperator.WITHIN_THE_NEXT;
                    } else if (filter.Operator === SearchOperator.LESS_THAN) {
                        filter.Operator = SearchOperator.IN_LESS_THAN;
                    } else if (filter.Operator === SearchOperator.GREATER_THAN) {
                        filter.Operator = SearchOperator.IN_MORE_THAN;
                    }
                }

                preparedFilter.push(filter);
            }
            else {
                // this is a BETWEEN
                const propertyFilter = preparedFilter.find(
                    (f) => f.Field === filter.Field && f.Operator === SearchOperator.BETWEEN
                );
                if (propertyFilter) {
                    const dateA = filter.Value;
                    const dateB = propertyFilter.Value;
                    if (SortUtil.compareDate(dateA, dateB) > 0) {
                        propertyFilter.Value = [propertyFilter.Value, filter.Value];
                    } else {
                        propertyFilter.Value = [filter.Value, propertyFilter.Value];
                    }
                } else {
                    filter.Operator = SearchOperator.BETWEEN;
                    preparedFilter.push(filter);
                }
            }
        } else {
            // just add it unhandled
            preparedFilter.push(filter);
        }
    }

}
