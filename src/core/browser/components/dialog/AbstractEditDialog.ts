/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ValidationResult, ValidationSeverity, ComponentContent, OverlayType, KIXObjectType,
    Error, ContextMode, ContextType, FormContext
} from "../../../model";
import { OverlayService } from "../../OverlayService";
import { DialogService } from "./DialogService";
import { KIXObjectService } from "../../kix";
import { FormService } from "../../form";
import { AbstractMarkoComponent } from "../../marko";
import { BrowserUtil } from "../../BrowserUtil";
import { ContextService, AdditionalContextInformation } from "../../context";
import { TranslationService } from "../../i18n/TranslationService";
import { EventService } from "../../event";
import { ApplicationEvent } from "../../application";

export abstract class AbstractEditDialog extends AbstractMarkoComponent<any> {

    protected loadingHint: string;
    protected successHint: string;
    protected objectType: KIXObjectType;
    protected contextId: string;

    protected async init(
        loadingHint: string, successHint: string = 'Translatable#Changes saved.', objectType: KIXObjectType,
        detailsContextId: string
    ) {
        this.loadingHint = await TranslationService.translate(loadingHint);
        this.successHint = await TranslationService.translate(successHint);
        this.objectType = objectType;
        this.contextId = detailsContextId;
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
        const dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, [ContextMode.EDIT, ContextMode.EDIT_ADMIN]
        );
        if (dialogContext) {
            this.state.formId = await FormService.getInstance().getFormIdByContext(
                FormContext.EDIT, this.objectType
            );
            dialogContext.setAdditionalInformation(AdditionalContextInformation.FORM_ID, this.state.formId);
        }
    }

    public async onDestroy(): Promise<void> {
        const dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, [ContextMode.EDIT, ContextMode.EDIT_ADMIN]
        );
        if (dialogContext) {
            dialogContext.resetAdditionalInformation();
        }
    }

    public async cancel(): Promise<void> {
        DialogService.getInstance().closeMainDialog();
    }

    public submit(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(async () => {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    AbstractEditDialog.prototype.showValidationError.call(this, result);
                } else {
                    DialogService.getInstance().setMainDialogLoading(true, this.loadingHint);
                    let context;
                    if (this.contextId) {
                        context = await ContextService.getInstance().getContext(this.contextId);
                    } else {
                        context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                    }
                    if (context && context.getObjectId()) {
                        KIXObjectService.updateObjectByForm(this.objectType, this.state.formId, context.getObjectId())
                            .then(async (objectId) => {
                                await AbstractEditDialog.prototype.handleDialogSuccess.call(this, objectId);
                                resolve();
                            }).catch((error: Error) => {
                                DialogService.getInstance().setMainDialogLoading(false);
                                BrowserUtil.openErrorOverlay(
                                    error.Message ? `${error.Code}: ${error.Message}` : error.toString()
                                );
                                reject();
                            });
                    }
                }
            }, 300);
        });
    }

    protected async handleDialogSuccess(objectId: string | number): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(false);
        DialogService.getInstance().submitMainDialog();

        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            if (context) {
                if (context.getDescriptor().contextType === ContextType.DIALOG) {
                    EventService.getInstance().publish(ApplicationEvent.REFRESH);
                } else {
                    context.getObject(this.objectType, true);
                }
            }
        } else {
            EventService.getInstance().publish(ApplicationEvent.REFRESH);
        }

        FormService.getInstance().deleteFormInstance(this.state.formId);
        BrowserUtil.openSuccessOverlay(this.successHint);
    }

    protected showValidationError(result: ValidationResult[]): void {
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
