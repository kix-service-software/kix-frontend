/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { PlaceholderService } from './PlaceholderService';

export class KIXObjectPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '010-KIXObjectPlaceholderHandler';
    protected objectStrings: string[] = ['OBJECT'];

    public isHandlerForObjectType(objectType: KIXObjectType | string): boolean {
        return objectType === 'OBJECT';
    }

    public async replace(placeholder: string, object?: KIXObject, language?: string): Promise<string> {
        let result = '';
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        if (object && this.isHandlerFor(objectString)) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute && attribute === KIXObjectProperty.LINK_COUNT) {
                result = object?.LinkCount?.toString();
            }
        }

        return result;
    }
}