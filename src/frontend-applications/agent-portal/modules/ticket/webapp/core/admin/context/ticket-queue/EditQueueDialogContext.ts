/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { AdditionalContextInformation } from '../../../../../../base-components/webapp/core/AdditionalContextInformation';
import { KIXObjectService } from '../../../../../../base-components/webapp/core/KIXObjectService';
import { Queue } from '../../../../../model/Queue';
import { QueueProperty } from '../../../../../model/QueueProperty';

export class EditQueueDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-ticket-queue-dialog-context';

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType = KIXObjectType.QUEUE): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.QUEUE) {
            object = this.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
            if (!object) {
                const loadingOptions = new KIXObjectLoadingOptions();
                loadingOptions.includes = [QueueProperty.ASSIGNED_PERMISSIONS];
                const objects = await KIXObjectService.loadObjects<Queue>(
                    KIXObjectType.QUEUE, [this.getObjectId()], loadingOptions
                );

                if (objects?.length) {
                    object = objects[0];
                }
            }
        }
        return object;
    }

}
