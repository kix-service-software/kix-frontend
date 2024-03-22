/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { SearchContext } from '../../../../search/webapp/core';
import { TicketProperty } from '../../../model/TicketProperty';
export class TicketSearchContext extends SearchContext {

    public static CONTEXT_ID: string = 'search-ticket-context';

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-search-ticket';
    }

    public getAdditionalInformation(key: string): any {
        if (key === AdditionalContextInformation.OBJECT_DEPENDENCY) {
            const queueCriterion = this.searchCache?.criteria?.find((c) => c.property === TicketProperty.QUEUE_ID);
            return queueCriterion?.value || [];
        }

        return super.getAdditionalInformation(key);
    }

}
