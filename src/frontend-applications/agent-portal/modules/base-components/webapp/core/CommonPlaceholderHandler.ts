/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AbstractPlaceholderHandler } from './AbstractPlaceholderHandler';
import { DateTimeUtil } from './DateTimeUtil';
import { PlaceholderService } from './PlaceholderService';

export class CommonPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '010-CommonPlaceholderHandler';
    protected objectStrings: string[] = ['OBJECT', 'NOW'];

    public isHandlerForObjectType(objectType: KIXObjectType | string): boolean {
        return objectType === 'OBJECT';
    }

    public async replace(placeholder: string, object?: KIXObject, language?: string): Promise<string> {
        let result = '';
        if (this.isHandlerFor(placeholder)) {
            const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
            if (object && objectString === 'OBJECT') {
                const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
                if (attribute && attribute === KIXObjectProperty.LINK_COUNT) {
                    result = object?.LinkCount?.toString();
                }
            } else if (objectString === 'NOW') {
                const now = new Date();
                const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
                if (attribute) {
                    switch (attribute) {
                        case 'Date':
                            result = DateTimeUtil.getKIXDateString(now);
                            break;
                        case 'Time':
                            result = DateTimeUtil.getKIXTimeString(now, false);
                            break;
                        case 'DateTime':
                            result = DateTimeUtil.getKIXDateTimeString(now);
                            break;
                        default:
                    }
                } else {
                    result = DateTimeUtil.getKIXDateTimeString(now);
                }
            }
        }

        return result;
    }
}