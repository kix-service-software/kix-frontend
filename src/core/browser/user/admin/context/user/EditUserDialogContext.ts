/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ContextDescriptor, Context, ContextConfiguration, KIXObject,
    KIXObjectType, KIXObjectLoadingOptions, UserProperty, User
} from "../../../../../model";
import { KIXObjectService } from "../../../../kix";

export class EditUserDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-user-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType = KIXObjectType.USER): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.USER) {
            const userId = this.getObjectId();
            if (userId) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null, [UserProperty.PREFERENCES, UserProperty.ROLEIDS]
                );
                const objects = await KIXObjectService.loadObjects<User>(KIXObjectType.USER, [userId], loadingOptions);
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }

}
