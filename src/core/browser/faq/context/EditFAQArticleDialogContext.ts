/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../model/components/context/Context";
import { KIXObject, KIXObjectType, KIXObjectLoadingOptions } from "../../../model";
import { KIXObjectService } from "../../kix";

export class EditFAQArticleDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-faq-article-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                ['Attachments', 'Links'],
                ['Links']
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

}
