/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { User } from '../../../../../user/model/User';
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
            if (this.objectValueMapper?.object) {
                this.objectBindingIds = [
                    this.objectValueMapper.object.addBinding(TicketProperty.QUEUE_ID, () => {
                        this.setLoadingOptions();
                        this.updateValue();
                    })
                ];
            }
        }

        this.setLoadingOptions();

        this.loadInitialUser();
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

    public async reset(
        ignoreProperties?: string[], ignoreFormValueProperties?: string[], ignoreFormValueReset?: string[]
    ): Promise<void> {
        await super.reset(ignoreProperties, ignoreFormValueProperties, ignoreFormValueReset);
        await this.loadInitialUser();
    }

    protected async loadInitialUser(): Promise<void> {
        if (this.enabled) {
            this.loadingOptions.limit = 10;
            this.loadingOptions.searchLimit = 10;
            const users = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, null, this.loadingOptions)
                .catch((): User[] => []);
            if (users?.length) {
                await this.prepareSelectableNodes(users);
            }
        }
    }

    protected async updateValue(): Promise<void> {
        if (this.value) {
            const userId: number = Array.isArray(this.value) && this.value.length
                ? Number(this.value[0])
                : Number(this.value);

            const loadingOptions = JSON.parse(JSON.stringify(this.loadingOptions));
            loadingOptions.limit = 1;
            loadingOptions.filter = [
                new FilterCriteria(
                    UserProperty.USER_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, userId
                )
            ];

            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, null, loadingOptions
            ).catch(() => []);

            if (!users.length) {
                this.value = null;
            }
        }
    }
}