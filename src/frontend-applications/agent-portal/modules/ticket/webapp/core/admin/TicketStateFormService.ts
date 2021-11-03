/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TicketState } from '../../../model/TicketState';
import { TicketStateProperty } from '../../../model/TicketStateProperty';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';


export class TicketStateFormService extends KIXObjectFormService {

    private static INSTANCE: TicketStateFormService = null;

    public static getInstance(): TicketStateFormService {
        if (!TicketStateFormService.INSTANCE) {
            TicketStateFormService.INSTANCE = new TicketStateFormService();
        }

        return TicketStateFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_STATE;
    }

    protected async getValue(property: string, value: any, ticketState: TicketState): Promise<any> {
        if (value) {
            switch (property) {
                case TicketStateProperty.TYPE_ID:
                    const stateTypes = await KIXObjectService.loadObjects(KIXObjectType.TICKET_STATE_TYPE, [value]);
                    if (stateTypes && stateTypes.length) {
                        value = stateTypes[0].ObjectId;
                    }
                    break;
                default:
            }
        }
        return value;
    }
}
