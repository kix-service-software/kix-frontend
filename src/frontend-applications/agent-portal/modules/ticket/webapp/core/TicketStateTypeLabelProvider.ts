/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { TicketStateType } from '../../model/TicketStateType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TicketStateProperty } from '../../model/TicketStateProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';


export class TicketStateTypeLabelProvider extends LabelProvider<TicketStateType> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_STATE_TYPE;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof TicketStateType || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketStateProperty.NAME:
            case TicketStateProperty.ID:
                displayValue = 'Translatable#Icon';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        ticketStateType: TicketStateType, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketStateType[property];

        switch (property) {
            case TicketStateProperty.ID:
                displayValue = ticketStateType.Name;
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        ticketStateType: TicketStateType, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        return translatable ? await TranslationService.translate(ticketStateType.Name) : ticketStateType.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#State Types' : 'Translatable#State Type'
            );
        }
        return plural ? 'States' : 'State';
    }

    public async getObjectTooltip(ticketStateType: TicketStateType, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(ticketStateType.Name);
        }
        return ticketStateType.Name;
    }

    public async getIcons(
        ticketStateType: TicketStateType, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketStateProperty.ID) {
            return [new ObjectIcon(null, 'StateTypes', ticketStateType.ID)];
        }
        return null;
    }

}
