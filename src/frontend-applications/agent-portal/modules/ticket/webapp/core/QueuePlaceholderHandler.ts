/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Ticket } from '../../model/Ticket';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { QueueProperty } from '../../model/QueueProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { Queue } from '../../model/Queue';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';

export class QueuePlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '300-QueuePlaceholderHandler';

    public async replace(
        placeholder: string, ticket?: Ticket, language?: string, forRichtext?: boolean,
        translate: boolean = true
    ): Promise<string> {
        let result = '';
        const queue = await this.getQueue(ticket);
        if (queue) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute && this.isKnownProperty(attribute)) {
                switch (attribute) {
                    case QueueProperty.QUEUE_ID:
                    case KIXObjectProperty.VALID_ID:
                    case QueueProperty.PARENT_ID:
                    case QueueProperty.SYSTEM_ADDRESS_ID:
                    case QueueProperty.FOLLOW_UP_ID:
                        result = queue[attribute] ? queue[attribute].toString() : '';
                        break;
                    case QueueProperty.NAME:
                    case QueueProperty.FULLNAME:
                        result = await LabelService.getInstance().getDisplayText(queue, attribute, undefined, false);
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        if (translate) {
                            result = await DateTimeUtil.getLocalDateTimeString(queue[attribute], language);
                        } else {
                            result = queue[attribute];
                        }
                        break;
                    case QueueProperty.SUB_QUEUES:
                        break;
                    case QueueProperty.SIGNATURE:
                        result = await this.prepareSignature(queue, ticket, attribute, language, forRichtext);
                        break;
                    default:
                        result = await LabelService.getInstance().getDisplayText(queue, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? translate ? await TranslationService.translate(result.toString(), undefined, language)
                                : result.toString() : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(QueueProperty).map((p) => QueueProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return knownProperties.some((p) => p === property);
    }

    private async getQueue(ticket: Ticket): Promise<Queue> {
        let queue: Queue = null;
        if (ticket.QueueID) {
            const queues = await KIXObjectService.loadObjects<Queue>(
                KIXObjectType.QUEUE, [ticket.QueueID], null, null, true
            ).catch((error) => [] as Queue[]);
            queue = queues && !!queues.length ? queues[0] : null;
        }
        return queue;
    }

    private async prepareSignature(
        queue: Queue, ticket: Ticket, attribute: string, language: string, forRichtext?: boolean
    ): Promise<string> {
        let result = await LabelService.getInstance().getDisplayText(queue, attribute, undefined, false);
        const signatureRegex = PlaceholderService.getInstance().getPlaceholderRegex(
            'QUEUE', QueueProperty.SIGNATURE, false
        );
        while (result.match(signatureRegex)) {
            result = result.replace(signatureRegex, '');
        }
        result = await PlaceholderService.getInstance().replacePlaceholders(
            result, ticket, language, forRichtext
        );
        return result;
    }
}
