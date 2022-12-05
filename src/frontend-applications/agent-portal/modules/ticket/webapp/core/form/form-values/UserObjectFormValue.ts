/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../../model/configuration/AutoCompleteConfiguration';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectProperty } from '../../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { UserProperty } from '../../../../../user/model/UserProperty';
import { Ticket } from '../../../../model/Ticket';

export class UserObjectFormValue extends SelectObjectFormValue {

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue) {
        super(property, ticket, objectValueMapper, parent);

        this.objectType = KIXObjectType.USER;
        this.isAutoComplete = true;
        this.autoCompleteConfiguration = new AutoCompleteConfiguration();
    }


    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);

        // add default loading options for (agent) users
        const filter: FilterCriteria[] = [
            new FilterCriteria(
                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, 1
            ),
            new FilterCriteria(
                UserProperty.IS_AGENT, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, 1
            )
        ];
        const query: [string, string][] = [
            ['requiredPermission', 'TicketRead,TicketCreate']
        ];

        if (!this.loadingOptions) {
            this.loadingOptions = new KIXObjectLoadingOptions();
        }

        if (Array.isArray(this.loadingOptions.filter)) {
            filter.forEach((f) => {
                if (!this.loadingOptions.filter.some((lof) => lof.property === f.property)) {
                    this.loadingOptions.filter.push(f);
                }
            });
        } else {
            this.loadingOptions.filter = filter;
        }

        if (Array.isArray(this.loadingOptions.query)) {
            query.forEach((q) => {
                if (!this.loadingOptions.query.some((loq) => loq[0] === q[0])) {
                    this.loadingOptions.query.push(q);
                }
            });
        } else {
            this.loadingOptions.query = query;
        }
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        if (this.object && this.property) {
            const userId = this.object[this.property];
            if (userId) {
                await this.setFormValue(userId, true);
            }
        }
    }

}