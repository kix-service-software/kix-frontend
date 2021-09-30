/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { TicketHistory } from '../../model/TicketHistory';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TicketHistoryProperty } from '../../model/TicketHistoryProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class TicketHistoryLabelProvider extends LabelProvider<TicketHistory> {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_HISTORY;

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case TicketHistoryProperty.HISTORY_TYPE:
                displayValue = 'Translatable#Action';
                break;
            case TicketHistoryProperty.NAME:
                displayValue = 'Translatable#Comment';
                break;
            case TicketHistoryProperty.ARTICLE_ID:
                displayValue = 'Translatable#to Article';
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

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        historyEntry: TicketHistory, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = historyEntry[property];

        switch (property) {
            case TicketHistoryProperty.ARTICLE_ID:
                displayValue = displayValue === 0 ?
                    ''
                    : await TranslationService.translate('Translatable#to Article');
                break;
            case TicketHistoryProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: TicketHistory, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: TicketHistory): string[] {
        return [];
    }

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof TicketHistory || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(object: TicketHistory): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public getObjectAdditionalText(object: TicketHistory): string {
        throw new Error('Method not implemented.');
    }

    public getObjectIcon(object: TicketHistory): string | ObjectIcon {
        throw new Error('Method not implemented.');
    }

    public async getObjectTooltip(object: TicketHistory): Promise<string> {
        throw new Error('Method not implemented.');
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = 'Translatable#Ticket History';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue);
        }

        return displayValue;
    }

    public async getIcons(object: TicketHistory, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === TicketHistoryProperty.ARTICLE_ID && object.ArticleID) {
            icons.push('kix-icon-open-right');
        }
        return icons;
    }

}
