/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { TicketType } from '../../model/TicketType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TicketTypeProperty } from '../../model/TicketTypeProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class TicketTypeLabelProvider extends LabelProvider<TicketType> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof TicketType || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketTypeProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case TicketTypeProperty.ID:
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
        ticketType: TicketType, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ticketType[property] || '';

        switch (property) {
            case TicketTypeProperty.ID:
            case 'ICON':
                displayValue = ticketType.Name;
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

    public async getObjectText(ticketType: TicketType, id?: boolean, title?: boolean, translatable: boolean = true
    ): Promise<string> {
        return translatable ? await TranslationService.translate(ticketType.Name) : ticketType.Name;
    }

    public getObjectIcon(ticketType?: TicketType): string | ObjectIcon {
        return new ObjectIcon(null, KIXObjectType.TICKET_TYPE, ticketType.ID, null, null, 'kix-icon-ticket');
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Types' : 'Translatable#Type'
            );
        }
        return plural ? 'Types' : 'Type';
    }

    public async getObjectTooltip(ticketType: TicketType, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(ticketType.Name);
        }
        return ticketType.Name;
    }

    public async getIcons(
        ticketType: TicketType, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === TicketTypeProperty.ID || property === 'ICON') {
            return [this.getObjectIcon(ticketType)];
        }
        return null;
    }

}
