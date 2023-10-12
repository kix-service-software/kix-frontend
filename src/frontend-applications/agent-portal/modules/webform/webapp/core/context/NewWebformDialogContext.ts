/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';

export class NewWebformDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-webform-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = KIXObjectType.WEBFORM,
        reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        if (objectType === KIXObjectType.WEBFORM) {
            object = this.getAdditionalInformation(AdditionalContextInformation.FORM_OBJECT);
        }
        return object;
    }

}
