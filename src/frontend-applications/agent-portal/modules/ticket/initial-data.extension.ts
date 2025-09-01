/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IInitialDataExtension } from '../../model/IInitialDataExtension';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXExtension } from '../../../../server/model/KIXExtension';
import { SearchCache } from '../search/model/SearchCache';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';
import { FilterCriteria } from '../../model/FilterCriteria';
import { TicketProperty } from '../ticket/model/TicketProperty';
import { SearchOperator } from '../search/model/SearchOperator';
import { FilterDataType } from '../../model/FilterDataType';
import { FilterType } from '../../model/FilterType';

class Extension extends KIXExtension implements IInitialDataExtension {

    public name: string = 'Ticket Module';

    public async createData(): Promise<void> {
        const fileName = 'shared_searches.json';
        const sharedSearches: SearchCache[] = ConfigurationService.getInstance().getDataFileContent(
            fileName, []
        ) || [];

        if (
            !sharedSearches.some(
                (s) => s.userId === 1 && s.objectType === KIXObjectType.TICKET
                    && s.name === 'Ticket Substitute'
            )
        ) {
            const criteria = [
                new FilterCriteria(
                    TicketProperty.TICKET_OOO_SUBSTITUTE, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, [KIXObjectType.CURRENT_USER]
                )
            ];

            const search = new SearchCache(
                null, null, KIXObjectType.TICKET, criteria, [], null, null, 'Ticket Substitute',
                null, null, null, 1, 'System'
            );

            sharedSearches.push(search);

            ConfigurationService.getInstance().saveDataFileContent(fileName, sharedSearches);
        }
    }
}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
