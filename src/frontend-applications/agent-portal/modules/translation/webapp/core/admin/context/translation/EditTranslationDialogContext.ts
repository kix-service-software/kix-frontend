/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../../model/Context';
import { KIXObject } from '../../../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { TranslationPatternProperty } from '../../../../../model/TranslationPatternProperty';
import { KIXObjectService } from '../../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationPattern } from '../../../../../model/TranslationPattern';

export class EditTranslationDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-translation-dialog-context';

    public async getObject<O extends KIXObject>(
        kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN
    ): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.TRANSLATION_PATTERN) {
            const patternId = this.getObjectId();
            if (patternId) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null, [TranslationPatternProperty.LANGUAGES]
                );
                const objects = await KIXObjectService.loadObjects<TranslationPattern>(
                    KIXObjectType.TRANSLATION_PATTERN, [patternId], loadingOptions
                );
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        const object = await this.getObject<TranslationPattern>();
        return object?.Value;
    }

}
