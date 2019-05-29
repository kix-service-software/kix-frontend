import {
    ValidationResult, ValidationSeverity, ComponentContent, OverlayType, KIXObjectType,
    Error, ContextMode
} from "../../../model";
import { OverlayService } from "../../OverlayService";
import { DialogService } from "./DialogService";
import { KIXObjectService } from "../../kix";
import { FormService } from "../../form";
import { AbstractMarkoComponent } from "../../marko";
import { BrowserUtil } from "../../BrowserUtil";
import { ContextService } from "../../context";
import { TranslationService } from "../../i18n/TranslationService";

export abstract class AbstractEditDialog extends AbstractMarkoComponent<any> {

    protected loadingHint: string;
    protected successHint: string;
    protected objectType: KIXObjectType;
    protected detailsContextId: string;

    protected init(
        loadingHint: string, successHint: string = 'Translatable#Changes saved.', objectType: KIXObjectType,
        detailsContextId: string
    ) {
        this.loadingHint = loadingHint;
        this.successHint = successHint;
        this.objectType = objectType;
        this.detailsContextId = detailsContextId;
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
    }

    public async onDestroy(): Promise<void> {
        const dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, ContextMode.EDIT
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
                    const context = await ContextService.getInstance().getContext(this.detailsContextId);
                    KIXObjectService.updateObjectByForm(this.objectType, this.state.formId, context.getObjectId())
                        .then(async (objectId) => {
                            await AbstractEditDialog.prototype.handleDialogSuccess.call(this, objectId);
                            resolve();
                        }).catch((error: Error) => {
                            DialogService.getInstance().setMainDialogLoading(false);
                            BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                            reject();
                        });
                }
            }, 300);
        });
    }

    protected async handleDialogSuccess(objectId: string | number): Promise<void> {
        await FormService.getInstance().loadFormConfigurations();

        DialogService.getInstance().setMainDialogLoading(false);
        DialogService.getInstance().submitMainDialog();
        if (this.detailsContextId) {
            const context = await ContextService.getInstance().getContext(this.detailsContextId);
            context.getObject(this.objectType, true);
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
