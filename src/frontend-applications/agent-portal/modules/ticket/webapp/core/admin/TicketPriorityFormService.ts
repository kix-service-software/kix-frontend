/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

export class TicketPriorityFormService extends KIXObjectFormService {

    private static INSTANCE: TicketPriorityFormService = null;

    public static getInstance(): TicketPriorityFormService {
        if (!TicketPriorityFormService.INSTANCE) {
            TicketPriorityFormService.INSTANCE = new TicketPriorityFormService();
        }

        return TicketPriorityFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_PRIORITY;
    }
}
