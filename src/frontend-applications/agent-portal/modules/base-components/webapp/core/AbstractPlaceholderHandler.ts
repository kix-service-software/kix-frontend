/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { IPlaceholderHandler } from './IPlaceholderHandler';
import { PlaceholderService } from './PlaceholderService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';

export class AbstractPlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'AbstractPlaceholderHandler';

    protected objectStrings: string[] = [];

    public constructor() {
        // nothing
    }

    public isHandlerFor(placeholder: string): boolean {
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        return this.objectStrings.some((os) => os === objectString);
    }

    public isHandlerForObjectType(objectType: KIXObjectType | string): boolean {
        return false;
    }

    public async replace(placeholder: string, object?: KIXObject, language?: string): Promise<string> {
        return '';
    }
}
