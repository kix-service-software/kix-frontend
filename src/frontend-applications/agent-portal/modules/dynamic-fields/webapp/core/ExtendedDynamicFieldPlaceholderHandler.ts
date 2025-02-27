/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler } from '../../../base-components/webapp/core/IPlaceholderHandler';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { DynamicFieldValue } from '../../model/DynamicFieldValue';

export class ExtendedDynamicFieldPlaceholderHandler implements IPlaceholderHandler {
    public handlerId: string;

    public isHandlerFor(objectString: string): boolean {
        return null;
    }

    public isHandlerForObjectType(objectType: string): boolean {
        return null;
    }

    public isHandlerForDFType(dfType: string): boolean {
        return null;
    }

    public async replaceDFObjectPlaceholder(
        attributePath: string, objectId: number, language?: string, forRichtext?: boolean, translate?: boolean
    ): Promise<string> {
        return;
    }

    public async replaceDFValue(
        object: KIXObject, optionString: string, language?: string, forRichtext?: boolean, translate?: boolean
    ): Promise<string> {
        return null;
    }

    public replace(
        placeholder: string, object?: KIXObject, language?: string, forRichtext?: boolean, translate?: boolean
    ): Promise<string> {
        return null;
    }

    public async getDFDisplayValue(
        object: KIXObject, dfValue: DynamicFieldValue, dfOptions: string = '',
        language?: string, forRichtext?: boolean, translate?: boolean
    ): Promise<string> {
        return null;
    }

    public async handleKey(object: KIXObject, dfValue: DynamicFieldValue): Promise<string> {
        return null;
    }

    public async handleValue(object: KIXObject, dfValue: DynamicFieldValue, language?: string): Promise<string> {
        return null;
    }

    public async handleShortValue(object: KIXObject, dfValue: DynamicFieldValue, language?: string): Promise<string> {
        return null;
    }

    public async handleHTMLValue(object: KIXObject, dfValue: DynamicFieldValue, language?: string): Promise<string> {
        return null;
    }

    public async handleObjectValue(object: KIXObject, dfOptions: string = '', dfValue: DynamicFieldValue): Promise<string> {
        return null;
    }

    public async handleObject(
        object: KIXObject, dfOptions: string = '', dfValue: DynamicFieldValue,
        language?: string, translate?: boolean
    ): Promise<string> {
        return null;
    }

    public getChecklistStringValue(dfValue: DynamicFieldValue): string {
        return null;
    }

    public getChecklistHTMLValue(dfValue: DynamicFieldValue): string {
        return null;
    }

}
