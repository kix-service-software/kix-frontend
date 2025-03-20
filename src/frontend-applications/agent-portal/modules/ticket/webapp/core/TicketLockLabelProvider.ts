/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { TicketLock } from '../../model/TicketLock';

export class TicketLockLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET_LOCK;

    public isLabelProviderFor(object: TicketLock | KIXObject): boolean {
        return object instanceof TicketLock || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(
        ticketLock: TicketLock, id?: boolean, title?: boolean, translatable: boolean = true): Promise<string> {
        return translatable ? await TranslationService.translate(ticketLock.Name) : ticketLock.Name;
    }

    public getObjectIcon(ticketLock?: TicketLock): string | ObjectIcon {
        let icon = 'kix-icon-lock-open';

        if (ticketLock.ID === 2) {
            icon = 'kix-icon-lock-close';
        }

        return icon;
    }

}