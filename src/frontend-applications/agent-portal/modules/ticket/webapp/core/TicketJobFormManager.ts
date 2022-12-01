/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { JobProperty } from '../../../job/model/JobProperty';
import { AbstractJobFormManager } from '../../../job/webapp/core/AbstractJobFormManager';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { SearchService } from '../../../search/webapp/core';
import { TicketSearchFormManager } from './TicketSearchFormManager';

export class TicketJobFormManager extends AbstractJobFormManager {

    public constructor() {
        super();
        const searchDefinition = SearchService.getInstance().getSearchDefinition(KIXObjectType.TICKET);
        if (searchDefinition) {

            // use own manager to extend operators
            this.filterManager = new TicketJobFilterFormManager([SearchProperty.FULLTEXT], false);

            this.filterManager.init = (): void => {

                // get extended managers on init because they could be added after filterManager was created
                if (searchDefinition) {
                    this.filterManager['extendedFormManager'] = [];
                    searchDefinition.formManager.getExtendedFormManager().forEach(
                        (m) => this.filterManager.addExtendedFormManager(m)
                    );
                }
            };
        }
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        if (property === JobProperty.FILTER && Array.isArray(value)) {
            value.forEach((v: FilterCriteria) => {

                // backend mostly does not support a list value with equal operator
                if (v.operator === SearchOperator.EQUALS && Array.isArray(v.value)) {
                    v.value = v.value[0];
                }
            });
        }
        return [[property, value]];
    }
}

// tslint:disable-next-line:max-classes-per-file
class TicketJobFilterFormManager extends TicketSearchFormManager {

    // do not mark viewable states as required
    public handleViewableStateType: boolean = false;

    // TODO: extend Operators, remove if Operators are not limited anymore (Ticket.ts -> SEARCH_PROPERTIES)
    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        return await super.getOperations(property);
    }

}
