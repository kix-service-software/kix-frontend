/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';


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

    protected async getValue(
        property: string, value: any, ticketState: TicketState,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case TicketStateProperty.TYPE_ID:
                if (value) {
                    const stateTypes = await KIXObjectService.loadObjects(KIXObjectType.TICKET_STATE_TYPE, [value]);
                    if (stateTypes && stateTypes.length) {
                        value = stateTypes[0].ObjectId;
                    }
                }
                break;
            default:
        }

        return super.getValue(property, value, ticketState, formField, formContext);
    }
}
