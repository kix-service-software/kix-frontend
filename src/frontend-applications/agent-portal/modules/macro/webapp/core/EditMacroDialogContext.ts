/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../model/Context';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { MacroProperty } from '../../model/MacroProperty';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';

export class EditMacroDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-macro-dialog-context';

    public async initContext(): Promise<void> {
        await super.initContext();

        const formId = this.getAdditionalInformation(AdditionalContextInformation.FORM_ID);
        if (formId) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            if (formInstance) {
                let scope = this.getAdditionalInformation(MacroProperty.SCOPE);
                formInstance.provideFixedValue(MacroProperty.SCOPE, new FormFieldValue(scope));
            }
        }
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.MACRO, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [
                    MacroProperty.ACTIONS
                ]
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

}
