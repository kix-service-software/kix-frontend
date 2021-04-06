/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../../../model/configuration/FormContext';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractNewDialog } from '../../../../base-components/webapp/core/AbstractNewDialog';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { DialogService } from '../../../../base-components/webapp/core/DialogService';
import { FormService } from '../../../../base-components/webapp/core/FormService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { OverlayService } from '../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../base-components/webapp/core/OverlayType';
import { StringContent } from '../../../../base-components/webapp/core/StringContent';
import { ValidationSeverity } from '../../../../base-components/webapp/core/ValidationSeverity';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { NewReportDialogContext } from '../../core/context/NewReportDialogContext';
import { ComponentState } from './ComponentState';

class Component extends AbstractNewDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Create Report',
            'Translatable#Report successfully created.',
            KIXObjectType.REPORT,
            null
        );
    }

    public async onMount(): Promise<void> {
        this.state.translations = TranslationService.createTranslationObject([
            'Translatable#Cancel', 'Translatable#Create'
        ]);
        this.createForm();

        this.state.prepared = true;
    }

    private createForm(): void {
        const form = new FormConfiguration(
            'new-report-form', 'New Report Form', [], KIXObjectType.REPORT, true, FormContext.NEW
        );

        FormService.getInstance().addForm(form);
        this.state.formId = form.id;
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const result = await formInstance.validateForm();
        const validationError = result.some((r) => r && r.severity === ValidationSeverity.ERROR);
        if (validationError) {
            if (this.showValidationError) {
                this.showValidationError(result);
            } else {
                this.showValidationError.call(this, result);
            }
        } else {
            const context = await ContextService.getInstance().getContext(NewReportDialogContext.CONTEXT_ID);
            if (context) {
                const definition = context.getAdditionalInformation(KIXObjectType.REPORT_DEFINITION);
                if (definition) {

                    BrowserUtil.toggleLoadingShield(
                        true, this.loadingHint, null,
                        () => {
                            BrowserUtil.toggleLoadingShield(false);
                            DialogService.getInstance().closeMainDialog();
                        }, 'Translatable#send to background'
                    );

                    await KIXObjectService.createObjectByForm(KIXObjectType.REPORT, this.state.formId)
                        .then(async (objectId: number) => {
                            await this.handleDialogSuccess(objectId);
                            ContextService.getInstance().updateObjectLists(this.objectType);
                        }).catch((error: Error): any => {
                            console.error(error);
                            const content = new StringContent(
                                'Translatable#An error occured during report creation. See system log for details.'
                            );

                            OverlayService.getInstance().openOverlay(
                                OverlayType.WARNING, null, content, 'Translatable#Error!', null, true
                            );
                        });

                    BrowserUtil.toggleLoadingShield(false);
                }
            }
        }
    }

    protected async handleDialogSuccess(objectId: string | number): Promise<void> {
        await super.handleDialogSuccess(objectId);
    }

}

module.exports = Component;
