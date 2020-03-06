/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from "./AbstractMarkoComponent";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TranslationService } from "../../../translation/webapp/core/TranslationService";
import { DialogService } from "./DialogService";
import { ContextService } from "./ContextService";
import { ContextMode } from "../../../../model/ContextMode";
import { FormService } from "./FormService";
import { FormContext } from "../../../../model/configuration/FormContext";
import { AdditionalContextInformation } from "./AdditionalContextInformation";
import { ValidationSeverity } from "./ValidationSeverity";
import { ContextType } from "../../../../model/ContextType";
import { KIXObjectService } from "./KIXObjectService";
import { BrowserUtil } from "./BrowserUtil";
import { EventService } from "./EventService";
import { ApplicationEvent } from "./ApplicationEvent";
import { ValidationResult } from "./ValidationResult";
import { ComponentContent } from "./ComponentContent";
import { OverlayService } from "./OverlayService";
import { OverlayType } from "./OverlayType";
import { Error } from "../../../../../../server/model/Error";
import { AbstractNewDialog } from "./AbstractNewDialog";

export abstract class AbstractEditDialog extends AbstractMarkoComponent<any> {

    protected loadingHint: string;
    protected successHint: string;
    protected objectType: KIXObjectType | string;
    protected contextId: string;

    protected async init(
        loadingHint: string, successHint: string = 'Translatable#Changes saved.', objectType: KIXObjectType | string,
        detailsContextId: string
    ) {
        this.loadingHint = await TranslationService.translate(loadingHint);
        this.successHint = await TranslationService.translate(successHint);
        this.objectType = objectType;
        this.contextId = detailsContextId;
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint(
            // tslint:disable-next-line:max-line-length
            'Translatable#For keyboard navigation, press "Ctrl" to switch focus to dialog. See manual for more detailed information.'
        );
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

        EventService.getInstance().subscribe(ApplicationEvent.DIALOG_SUBMIT, {
            eventSubscriberId: 'AbstractDialog' + this.state.formId,
            eventPublished: (data: any, eventId: string) => {
                if (data && data.formId === this.state.formId) {
                    this.submit();
                }
            }
        });
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

    public submit(objectId?: number | string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(async () => {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    if (this.showValidationError) {
                        this.showValidationError(result);
                    } else {
                        AbstractEditDialog.prototype.showValidationError.call(this, result);
                    }

                    ContextService.getInstance().updateObjectLists(this.objectType);

                } else {
                    DialogService.getInstance().setMainDialogLoading(true, this.loadingHint);
                    if (!objectId) {
                        let context;
                        if (this.contextId) {
                            context = await ContextService.getInstance().getContext(this.contextId);
                        } else {
                            context = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
                        }
                        if (context && context.getObjectId()) {
                            objectId = context.getObjectId();
                        }
                    }
                    KIXObjectService.updateObjectByForm(this.objectType, this.state.formId, objectId)
                        .then(async (succesObjectId) => {
                            if (this.handleDialogSuccess) {
                                await this.handleDialogSuccess(succesObjectId);
                            } else {
                                await AbstractEditDialog.prototype.handleDialogSuccess.call(this, succesObjectId);
                            }
                            resolve();
                        }).catch((error: Error) => {
                            DialogService.getInstance().setMainDialogLoading(false);
                            BrowserUtil.openErrorOverlay(
                                error.Message ? `${error.Code}: ${error.Message}` : error.toString()
                            );
                            reject();
                        });
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
            OverlayType.WARNING, null, content, 'Translatable#Validation error', null, true
        );
    }

}
