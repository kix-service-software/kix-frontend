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
    KIXObjectSpecificCreateOptions, Error, ContextMode, FormContext, Context, Translation
} from "../../../model";
import { OverlayService } from "../../OverlayService";
import { DialogService } from "./DialogService";
import { KIXObjectService } from "../../kix";
import { FormService } from "../../form";
import { AbstractMarkoComponent } from "../../marko";
import { BrowserUtil } from "../../BrowserUtil";
import { RoutingConfiguration, RoutingService } from "../../router";
import { ContextService, AdditionalContextInformation } from "../../context";
import { EventService } from "../../event";
import { TabContainerEvent } from "./TabContainerEvent";
import { TabContainerEventData } from "./TabContainerEventData";
import { PreviousTabData } from "./PreviousTabData";
import { TranslationService } from "../../i18n/TranslationService";
import { ApplicationEvent } from "../../application";

export abstract class AbstractNewDialog extends AbstractMarkoComponent<any> {

    protected loadingHint: string;
    protected successHint: string;
    protected objectType: KIXObjectType;
    protected routingConfiguration: RoutingConfiguration;
    protected options: KIXObjectSpecificCreateOptions;
    protected dialogContext: Context;

    protected async init(
        loadingHint: string, successHint: string, objectType: KIXObjectType,
        routingConfiguration: RoutingConfiguration
    ) {
        this.loadingHint = await TranslationService.translate(loadingHint);
        this.successHint = await TranslationService.translate(successHint);
        this.objectType = objectType;
        this.routingConfiguration = routingConfiguration;
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
        this.dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, [ContextMode.CREATE, ContextMode.CREATE_ADMIN, ContextMode.CREATE_SUB]
        );
        if (this.dialogContext) {
            this.state.formId = await FormService.getInstance().getFormIdByContext(
                FormContext.NEW, this.objectType
            );
            this.dialogContext.setAdditionalInformation(AdditionalContextInformation.FORM_ID, this.state.formId);
        }
    }

    public async onDestroy(): Promise<void> {
        AbstractNewDialog.prototype.resetDialog();
    }

    public async cancel(): Promise<void> {
        if (this.state.formId) {
            FormService.getInstance().deleteFormInstance(this.state.formId);
        }
        AbstractNewDialog.prototype.resetDialog();
        DialogService.getInstance().closeMainDialog();
    }

    private async resetDialog(): Promise<void> {
        const dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, [ContextMode.CREATE, ContextMode.CREATE_ADMIN, ContextMode.CREATE_SUB]
        );
        if (dialogContext) {
            dialogContext.resetAdditionalInformation();
        }
    }

    public submit(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(async () => {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                const result = await formInstance.validateForm();
                const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
                if (validationError) {
                    AbstractNewDialog.prototype.showValidationError.call(this, result);
                } else {
                    DialogService.getInstance().setMainDialogLoading(true, this.loadingHint);
                    KIXObjectService.createObjectByForm(this.objectType, this.state.formId, this.options)
                        .then(async (objectId) => {
                            await AbstractNewDialog.prototype.handleDialogSuccess.call(this, objectId);
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
        await FormService.getInstance().loadFormConfigurations();

        let previousTabData: PreviousTabData = null;
        if (this.dialogContext) {
            previousTabData = this.dialogContext.getAdditionalInformation(
                'RETURN_TO_PREVIOUS_TAB'
            );
        }

        if (previousTabData && previousTabData.objectType && previousTabData.tabId) {
            const previousDialogContext = await ContextService.getInstance().getContextByTypeAndMode(
                previousTabData.objectType, [ContextMode.CREATE, ContextMode.CREATE_ADMIN, ContextMode.CREATE_SUB]
            );
            if (previousDialogContext) {
                previousDialogContext.setAdditionalInformation(`${this.objectType}-ID`, objectId);
            }
            EventService.getInstance().publish(
                TabContainerEvent.CHANGE_TAB, new TabContainerEventData(previousTabData.tabId)
            );
            DialogService.getInstance().setMainDialogLoading(false);
        } else {
            DialogService.getInstance().setMainDialogLoading(false);
            DialogService.getInstance().submitMainDialog();
            if (this.routingConfiguration) {
                RoutingService.getInstance().routeToContext(this.routingConfiguration, objectId);
            } else {
                EventService.getInstance().publish(ApplicationEvent.REFRESH);
            }
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
