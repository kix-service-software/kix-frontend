import {
    ValidationResult, ValidationSeverity, ComponentContent, OverlayType, KIXObjectType, KIXObjectSpecificCreateOptions
} from "../../model";
import { OverlayService } from "../OverlayService";
import { DialogService } from "./DialogService";
import { KIXObjectService } from "../kix";
import { FormService } from "../form";
import { AbstractMarkoComponent } from "../marko";
import { BrowserUtil } from "../BrowserUtil";
import { RoutingConfiguration, RoutingService } from "../router";

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
        DialogService.getInstance().setMainDialogHint("Alle mit * gekennzeichneten Felder sind Pflichtfelder.");
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
                AbstractNewDialog.prototype.showValidationError.call(this, result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, this.loadingHint);
                await KIXObjectService.createObjectByForm(this.objectType, this.state.formId, this.options)
                    .then(async (ciClassId) => {
                        await FormService.getInstance().loadFormConfigurations();
                        DialogService.getInstance().setMainDialogLoading(false);
                        BrowserUtil.openSuccessOverlay(this.successHint);
                        DialogService.getInstance().closeMainDialog();
                        if (this.routingConfiguration) {
                            RoutingService.getInstance().routeToContext(this.routingConfiguration, ciClassId);
                        }
                    }).catch((error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        BrowserUtil.openErrorOverlay(error);
                    });
            }
        }, 300);
    }

    protected showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Fehler beim Validieren des Formulars:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Validierungsfehler', true
        );
    }

}
