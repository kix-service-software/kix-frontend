/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

export class BulkDialogContext extends Context {

    public static CONTEXT_ID: string = 'bulk-dialog-context';

    public deleteObjectList(objectType: KIXObjectType | string): void {
        return;
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await TranslationService.translate('Translatable#Bulk Action');
    }

    public getIcon(): string | ObjectIcon {
        return 'kix-icon-arrow-collect';
    }

    public supportsBackendSort(type: string): boolean {
        return false;
    }

    public async supportsBackendFilterForProperty(type: string, property: string): Promise<boolean> {
        return false;
    }

}
