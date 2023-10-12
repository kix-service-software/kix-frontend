/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';

export class TicketTypeFormService extends KIXObjectFormService {

    private static INSTANCE: TicketTypeFormService = null;

    public static getInstance(): TicketTypeFormService {
        if (!TicketTypeFormService.INSTANCE) {
            TicketTypeFormService.INSTANCE = new TicketTypeFormService();
        }

        return TicketTypeFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_TYPE;
    }
}
