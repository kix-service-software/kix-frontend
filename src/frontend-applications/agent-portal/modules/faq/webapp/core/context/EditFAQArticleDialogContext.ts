/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { FAQArticleProperty } from '../../../model/FAQArticleProperty';

export class EditFAQArticleDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-faq-article-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE,
        reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [KIXObjectProperty.DYNAMIC_FIELDS, FAQArticleProperty.ATTACHMENTS]
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

}
