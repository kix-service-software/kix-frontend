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

export interface IPlaceholderHandler {

    handlerId: string;

    isHandlerFor(placeholderString: string): boolean;

    isHandlerForObjectType(objectType: KIXObjectType | string): boolean;

    isHandlerForDFType(dfFieldType: string): boolean;

    replaceDFObjectPlaceholder(
        attributePath: string, objectId: number, language?: string, forRichtext?: boolean,
        translate?: boolean
    ): Promise<string>

    replace(
        placeholder: string, object?: KIXObject, language?: string, forRichtext?: boolean,
        translate?: boolean
    ): Promise<string>;

}
