/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from "../../../../../modules/base-components/webapp/core/AbstractMarkoComponent";
import { ComponentState } from "./ComponentState";
import { DialogService } from "../../../../../modules/base-components/webapp/core/DialogService";
import { FormService } from "../../../../../modules/base-components/webapp/core/FormService";
import { ValidationSeverity } from "../../../../../modules/base-components/webapp/core/ValidationSeverity";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { RoleDetailsContext } from "../../core/admin";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { BrowserUtil } from "../../../../../modules/base-components/webapp/core/BrowserUtil";
import { ValidationResult } from "../../../../../modules/base-components/webapp/core/ValidationResult";
import { ComponentContent } from "../../../../../modules/base-components/webapp/core/ComponentContent";
import { OverlayService } from "../../../../../modules/base-components/webapp/core/OverlayService";
import { OverlayType } from "../../../../../modules/base-components/webapp/core/OverlayType";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { Error } from "../../../../../../../server/model/Error";

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, 'Translatable#Update Role');

                const context = await ContextService.getInstance().getContext<RoleDetailsContext>(
                    RoleDetailsContext.CONTEXT_ID
                );

                await KIXObjectService.updateObjectByForm(
                    KIXObjectType.ROLE, this.state.formId, context.getObjectId()
                ).then(async (roleId) => {
                    context.getObject(KIXObjectType.ROLE, true);
                    DialogService.getInstance().setMainDialogLoading(false);

                    const toast = await TranslationService.translate('Translatable#Changes saved.');
                    BrowserUtil.openSuccessOverlay(toast);
                    DialogService.getInstance().submitMainDialog();
                }).catch((error: Error) => {
                    DialogService.getInstance().setMainDialogLoading(false);
                    BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                });
            }
        }, 300);
    }


    public showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', true
        );
    }

}

module.exports = Component;