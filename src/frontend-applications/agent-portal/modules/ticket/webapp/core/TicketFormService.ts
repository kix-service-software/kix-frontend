/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class TicketFormService extends KIXObjectFormService {

    private static INSTANCE: TicketFormService = null;

    public static getInstance(): TicketFormService {
        if (!TicketFormService.INSTANCE) {
            TicketFormService.INSTANCE = new TicketFormService();
        }

        return TicketFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET;
    }

}
