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

    protected handleBetweenValueOnLTE(preparedFilter: any[], filter: any) {
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

    protected handleBetweenValueOnGTE(preparedFilter: any[], filter: any) {
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
            preparedFilter.push(filter);
        }
    }

}
