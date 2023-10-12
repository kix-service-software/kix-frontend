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
import { ContextService } from './ContextService';

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

    public isHandlerForDFType(dfFieldType: string): boolean {
        return false;
    }

    public async replaceDFObjectPlaceholder(
        attributePath: string, objectId: number, language?: string
    ): Promise<string> {
        return;
    }

    public async replace(placeholder: string, object?: KIXObject, language?: string): Promise<string> {
        return '';
    }

    public async prepareObject(object: KIXObject): Promise<void> {
        const dialogContext = ContextService.getInstance().getActiveContext();
        if (dialogContext) {

            // get object from context (will possibly be the current form object)
            const contextObject = await dialogContext.getObject<KIXObject>(object.KIXObjectType);

            // include in own object (do not overwrite object from context)
            this.setObject(object, contextObject);
        }
    }

    protected setObject<t extends KIXObject>(object: t, objectToAdd: t): void {
        if (objectToAdd) {
            Object.getOwnPropertyNames(objectToAdd).forEach((property) => {
                if (typeof objectToAdd[property] !== 'undefined' && !this.ignoreProperty(property)) {
                    object[property] = objectToAdd[property];
                }
            });
        }
    }

    protected ignoreProperty(property: string): boolean {
        return false;
    }
}
