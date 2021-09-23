/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { SearchService } from '../../../search/webapp/core';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { AbstractJobFormManager } from '../../../job/webapp/core/AbstractJobFormManager';
import { TicketSearchFormManager } from './TicketSearchFormManager';
import { SearchOperator } from '../../../search/model/SearchOperator';

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
}

// tslint:disable-next-line:max-classes-per-file
class TicketJobFilterFormManager extends TicketSearchFormManager {

    // TODO: extend Operators, remove if Operators are not limited anymore (Ticket.ts -> SEARCH_PROPERTIES)
    public async getOperations(property: string): Promise<Array<string | SearchOperator>> {
        const operations: Array<string | SearchOperator> = await super.getOperations(property);

        if (operations.some((o) => o === SearchOperator.IN) && !operations.some((o) => o === SearchOperator.EQUALS)) {
            operations.push(SearchOperator.EQUALS);
        }

        return operations;
    }

}
