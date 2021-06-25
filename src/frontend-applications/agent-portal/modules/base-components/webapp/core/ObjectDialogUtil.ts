/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Error } from '../../../../../../server/model/Error';
import { ContextMode } from '../../../../model/ContextMode';
import { BrowserUtil } from './BrowserUtil';
import { ContextService } from './ContextService';
import { KIXObjectService } from './KIXObjectService';
import { ValidationSeverity } from './ValidationSeverity';

export class ObjectDialogUtil {

    private static EDIT_MODES = [
        ContextMode.EDIT,
        ContextMode.EDIT_ADMIN,
        ContextMode.EDIT_BULK,
        ContextMode.EDIT_LINKS,
    ];

    public static async submit(silent?: boolean): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formId = await context?.getFormManager()?.getFormId();

        const formInstance = await context?.getFormManager()?.getFormInstance();

        const result = await formInstance.validateForm();
        const isValid = !result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (isValid) {
            let objectId: string | number;

            let submitFunc = KIXObjectService.createObjectByForm;
            if (this.EDIT_MODES.some((em) => em === context.descriptor.contextMode)) {
                submitFunc = KIXObjectService.updateObjectByForm;
                objectId = context.getObjectId();
            }

            submitFunc(context.descriptor.kixObjectTypes[0], formId, objectId)
                .then(async (newObjectId: number | string) => {
                    await ContextService.getInstance().toggleActiveContext(
                        context.descriptor.targetContextId, newObjectId, silent
                    );

                    await BrowserUtil.openSuccessOverlay('Translatable#Success');
                }).catch((error: Error) => {
                    BrowserUtil.openErrorOverlay(
                        error.Message ? `${error.Code}: ${error.Message}` : error.toString()
                    );
                    throw error;
                });
        } else {
            throw new Error('1', 'Validation Error');
        }
    }

}
