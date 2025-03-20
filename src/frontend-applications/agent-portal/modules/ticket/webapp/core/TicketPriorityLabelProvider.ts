/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { TicketPriority } from '../../model/TicketPriority';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TicketPriorityProperty } from '../../model/TicketPriorityProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';


export class TicketPriorityLabelProvider extends LabelProvider<TicketPriority> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof TicketPriority || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketPriorityProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TicketPriorityProperty.ID:
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
        ticketPriority: TicketPriority, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketPriority[property];

        switch (property) {
            case TicketPriorityProperty.ID:
            case 'ICON':
                displayValue = ticketPriority.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        ticketPriority: TicketPriority, id?: boolean, title?: boolean, translatable: boolean = true): Promise<string> {
        return translatable ? await TranslationService.translate(ticketPriority.Name) : ticketPriority.Name;

    }

    public getObjectIcon(ticketPriority?: TicketPriority): string | ObjectIcon {
        return new ObjectIcon(null, KIXObjectType.TICKET_PRIORITY, ticketPriority.ID, null, null, 'fas fa-asterisk');
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Priorities' : 'Translatable#Priority'
            );
        }
        return plural ? 'Priorities' : 'Priority';
    }

    public async getObjectTooltip(ticketPriority: TicketPriority, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(ticketPriority.Name);
        }
        return ticketPriority.Name;
    }

    public async getIcons(
        ticketPriority: TicketPriority, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketPriorityProperty.ID || property === 'ICON') {
            return [new ObjectIcon(null, 'Priority', ticketPriority.ID, null, null, 'fas fa-asterisk')];
        }
        return null;
    }

}
