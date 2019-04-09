import {
    ValidationResult, ValidationSeverity, ComponentContent, OverlayType, KIXObjectType,
    KIXObjectSpecificCreateOptions, Error, ContextMode, DialogContextDescriptor
} from "../../../model";
import { OverlayService } from "../../OverlayService";
import { DialogService } from "./DialogService";
import { KIXObjectService } from "../../kix";
import { FormService } from "../../form";
import { AbstractMarkoComponent } from "../../marko";
import { BrowserUtil } from "../../BrowserUtil";
import { RoutingConfiguration, RoutingService } from "../../router";
import { ContextService } from "../../context";
import { EventService } from "../../event";
import { TabContainerEvent } from "./TabContainerEvent";
import { TabContainerEventData } from "./TabContainerEventData";
import { PreviousTabData } from "./PreviousTabData";

export abstract class AbstractNewDialog extends AbstractMarkoComponent<any> {

    protected loadingHint: string;
    protected successHint: string;
    protected objectType: KIXObjectType;
    protected routingConfiguration: RoutingConfiguration;
    protected options: KIXObjectSpecificCreateOptions;

    protected init(
        loadingHint: string, successHint: string, objectType: KIXObjectType,
        routingConfiguration: RoutingConfiguration
    ) {
        this.loadingHint = loadingHint;
        this.successHint = successHint;
        this.objectType = objectType;
        this.routingConfiguration = routingConfiguration;
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');
        const dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, ContextMode.CREATE
        );
        if (dialogContext) {
            dialogContext.getDescriptor<DialogContextDescriptor>().formId = this.state.formId;
        }
    }

    public async onDestroy(): Promise<void> {
        const dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, ContextMode.CREATE
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
                    AbstractNewDialog.prototype.showValidationError.call(this, result);
                } else {
                    DialogService.getInstance().setMainDialogLoading(true, this.loadingHint);
                    await KIXObjectService.createObjectByForm(this.objectType, this.state.formId, this.options)
                        .then(async (objectId) => {
                            await AbstractNewDialog.prototype.handleDialogSuccess.call(this, objectId);
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
        BrowserUtil.openSuccessOverlay(this.successHint);

        const dialogContext = await ContextService.getInstance().getContextByTypeAndMode(
            this.objectType, ContextMode.CREATE
        );
        let previousTabData: PreviousTabData = null;
        if (dialogContext) {
            previousTabData = dialogContext.getAdditionalInformation(
                'RETURN_TO_PREVIOUS_TAB'
            );
        }

        if (previousTabData && previousTabData.objectType && previousTabData.tabId) {
            const previousDialogContext = await ContextService.getInstance().getContextByTypeAndMode(
                previousTabData.objectType, ContextMode.CREATE
            );
            if (previousDialogContext) {
                previousDialogContext.setAdditionalInformation(`${this.objectType}-ID`, objectId);
            }
            EventService.getInstance().publish(
                TabContainerEvent.CHANGE_TAB, new TabContainerEventData(previousTabData.tabId)
            );
        } else {
            DialogService.getInstance().submitMainDialog();
            if (this.routingConfiguration) {
                RoutingService.getInstance().routeToContext(this.routingConfiguration, objectId);
            }
        }
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
