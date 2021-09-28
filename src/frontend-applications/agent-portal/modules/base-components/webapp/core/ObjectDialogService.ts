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
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from './BrowserUtil';
import { ContextService } from './ContextService';
import { EventService } from './EventService';
import { ExtendedObjectDialogService } from './ExtendedObjectDialogService';
import { FormEvent } from './FormEvent';
import { KIXObjectService } from './KIXObjectService';
import { ValidationSeverity } from './ValidationSeverity';

export class ObjectDialogService {

    private static EDIT_MODES = [
        ContextMode.EDIT,
        ContextMode.EDIT_ADMIN,
        ContextMode.EDIT_BULK,
        ContextMode.EDIT_LINK,
    ];

    private static INSTANCE: ObjectDialogService;

    private extendedDialogService: ExtendedObjectDialogService[];

    public static getInstance(): ObjectDialogService {
        if (!ObjectDialogService.INSTANCE) {
            ObjectDialogService.INSTANCE = new ObjectDialogService
                ();
        }
        return ObjectDialogService.INSTANCE;
    }

    private constructor() { }


    public async submit(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formId = await context?.getFormManager()?.getFormId();

        const formInstance = await context?.getFormManager()?.getFormInstance();

        const result = await formInstance.validateForm();
        const isValid = !result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (isValid) {
            let objectId: string | number;

            let submitFunc = KIXObjectService.createObjectByForm;
            if (ObjectDialogService.EDIT_MODES.some((em) => em === context.descriptor.contextMode)) {
                submitFunc = KIXObjectService.updateObjectByForm;
                objectId = context.getObjectId();
            }

            let canceled = false;
            const hint = await TranslationService.translate('Translatable#Save');
            BrowserUtil.toggleLoadingShield(
                'APP_SHIELD', true, hint, undefined,
                async () => {
                    await ContextService.getInstance().toggleActiveContext(undefined, undefined, true);
                    BrowserUtil.toggleLoadingShield('APP_SHIELD', false);
                    canceled = true;
                },
                'Translatable#send to background'
            );

            await submitFunc(context.descriptor.kixObjectTypes[0], formId, objectId)
                .then(async (newObjectId: number | string) => {
                    if (!canceled) {
                        await ContextService.getInstance().toggleActiveContext(
                            context.descriptor.targetContextId, newObjectId, true
                        );

                        await BrowserUtil.openSuccessOverlay('Translatable#Success');
                    }
                }).catch((error: Error) => {
                    BrowserUtil.openErrorOverlay(
                        error.Message ? `${error.Code}: ${error.Message}` : error.toString()
                    );
                    BrowserUtil.toggleLoadingShield('APP_SHIELD', false);
                    throw error;
                });

            BrowserUtil.toggleLoadingShield('APP_SHIELD', false);
        } else {
            EventService.getInstance().publish(FormEvent.GO_TO_INVALID_FIELD, {
                contextId: context.descriptor.contextId,
                formId
            });
            throw new Error('1', 'Validation Error');
        }
    }

}
