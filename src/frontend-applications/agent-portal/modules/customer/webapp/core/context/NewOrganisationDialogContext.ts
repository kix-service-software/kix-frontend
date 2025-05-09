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
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AdditionalContextInformation } from '../../../../base-components/webapp/core/AdditionalContextInformation';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';

export class NewOrganisationDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-organisation-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.ORGANISATION, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const objects = await KIXObjectService.loadObjects(objectType, [objectId]);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        let displayText = await super.getDisplayText(short);
        if (this.getAdditionalInformation(AdditionalContextInformation.DUPLICATE)) {
            displayText = await TranslationService.translate('Translatable#New {0} as copy of', [displayText]);
        }
        return displayText;
    }

}
