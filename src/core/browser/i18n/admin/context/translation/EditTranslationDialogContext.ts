/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/components/context/Context";
import {
    ContextDescriptor, ContextConfiguration, KIXObject, KIXObjectType,
    KIXObjectLoadingOptions, TranslationPatternProperty, TranslationPattern
} from "../../../../../model";
import { KIXObjectService } from "../../../../kix";

export class EditTranslationDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-translation-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

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
}
