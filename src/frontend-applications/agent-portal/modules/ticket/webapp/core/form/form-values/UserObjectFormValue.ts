/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { TicketProperty } from '../../../../model/TicketProperty';

export class UserObjectFormValue extends SelectObjectFormValue {

    private objectBindingIds: string[] = [];

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
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        if (this.object && this.property) {
            const userId = this.object[this.property];
            if (userId) {
                await this.setFormValue(userId, true);
            }

            if (this.objectValueMapper?.object) {
                this.objectBindingIds = [
                    this.objectValueMapper.object.addBinding(TicketProperty.QUEUE_ID, () => {
                        this.setLoadingOptions();
                        this.value = null;
                    })
                ];
            }
        }

        this.setLoadingOptions();
    }

    public async setLoadingOptions(): Promise<void> {
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

        const ticket = this.objectValueMapper?.object as Ticket;

        const requiredPermission = {
            Object: KIXObjectType.QUEUE,
            ObjectID: ticket?.QueueID,
            Permission: 'WRITE,READ'
        };

        const query: [string, string][] = [
            ['requiredPermission', JSON.stringify(requiredPermission)]
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

        this.loadingOptions.query = query;
    }

}