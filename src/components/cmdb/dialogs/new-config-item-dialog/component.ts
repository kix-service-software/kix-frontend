import {
    DialogService, OverlayService, FormService, ServiceRegistry, SearchOperator, KIXObjectService, BrowserUtil
} from '../../../../core/browser';
import {
    ComponentContent, OverlayType, StringContent, TreeNode, ValidationResult,
    ValidationSeverity, ConfigItemClass, KIXObjectType, ContextMode, ToastContent, KIXObjectLoadingOptions,
    FilterCriteria, ConfigItemClassProperty, FilterDataType, FilterType, ConfigItemProperty, Error
} from '../../../../core/model';
import { ComponentState } from './ComponentState';
import { CMDBService, ConfigItemDetailsContext, ConfigItemFormFactory } from '../../../../core/browser/cmdb';
import { RoutingService, RoutingConfiguration } from '../../../../core/browser/router';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const configItemClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null,
            new KIXObjectLoadingOptions(null, [
                new FilterCriteria(
                    ConfigItemClassProperty.CURRENT_DEFINITION, SearchOperator.NOT_EQUALS,
                    FilterDataType.STRING, FilterType.AND, null
                )], null, null, null,
                ['CurrentDefinition,Definitions']),
            null, false
        );

        this.state.classNodes = configItemClasses.map(
            (ci) => new TreeNode(ci, ci.Name)
        );
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async classChanged(nodes: TreeNode[]): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true);
        this.state.currentClassNode = nodes && nodes.length ? nodes[0] : null;
        FormService.getInstance().deleteFormInstance(this.state.formId);
        this.state.formId = null;
        let formId;
        if (this.state.currentClassNode) {
            const ciClass = this.state.currentClassNode.id as ConfigItemClass;
            formId = ConfigItemFormFactory.getInstance().getFormId(ciClass);
        } else {
            formId = null;
        }

        setTimeout(() => {
            this.state.formId = formId;
            DialogService.getInstance().setMainDialogLoading(false);
        }, 100);
    }

    public async submit(): Promise<void> {
        if (this.state.formId) {

            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);

            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, 'Config Item wird angelegt');
                const cmdbService
                    = ServiceRegistry.getServiceInstance<CMDBService>(KIXObjectType.CONFIG_ITEM);

                const ciClass = this.state.currentClassNode.id as ConfigItemClass;
                await cmdbService.createConfigItem(this.state.formId, ciClass.ID)
                    .then((configItemId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        BrowserUtil.openSuccessOverlay('Config Item wurde erfolgreich angelegt.');
                        DialogService.getInstance().submitMainDialog();
                        const routingConfiguration = new RoutingConfiguration(
                            null, ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
                            ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID, true
                        );
                        RoutingService.getInstance().routeToContext(routingConfiguration, configItemId);
                    }).catch((error: Error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                    });
            }
        }
    }

    private showValidationError(result: ValidationResult[]): void {
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

module.exports = Component;
