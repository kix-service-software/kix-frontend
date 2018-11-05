import {
    ContextService, DialogService, OverlayService, FormService, ServiceRegistry, SearchOperator, KIXObjectService
} from '@kix/core/dist/browser';
import {
    ComponentContent, OverlayType, StringContent, TreeNode, ValidationResult,
    ValidationSeverity, ConfigItemClass, KIXObjectType, ContextMode, ToastContent, KIXObjectLoadingOptions,
    FilterCriteria, ConfigItemClassProperty, FilterDataType, FilterType, ConfigItemProperty
} from '@kix/core/dist/model';
import { ComponentState } from './ComponentState';
import { CMDBService, ConfigItemDetailsContext } from '@kix/core/dist/browser/cmdb';
import { RoutingService, RoutingConfiguration } from '@kix/core/dist/browser/router';

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
                ['CurrentDefinition,Definitions'])
        );
        this.state.classNodes = configItemClasses.map(
            (ci) => new TreeNode(ci, ci.Name)
        );
    }

    public async classChanged(nodes: TreeNode[]): Promise<void> {
        DialogService.getInstance().setMainDialogLoading(true);
        this.state.currentClassNode = nodes && nodes.length ? nodes[0] : null;
        this.state.formId = null;
        let formId;
        if (this.state.currentClassNode) {
            const ciClass = this.state.currentClassNode.id as ConfigItemClass;
            formId = `CMDB_CI_${ciClass.Name}_${ciClass.ID}`;
        } else {
            formId = null;
        }

        if (formId) {
            await this.reset();
        }

        setTimeout(() => {
            this.state.formId = formId;
            DialogService.getInstance().setMainDialogLoading(false);
        }, 100);
    }

    public async cancel(): Promise<void> {
        if (this.state.formId) {
            await this.reset();
        }
        DialogService.getInstance().closeMainDialog();
    }

    private async reset(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.reset();
        }
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
                    = ServiceRegistry.getInstance().getServiceInstance<CMDBService>(KIXObjectType.CONFIG_ITEM);

                const ciClass = this.state.currentClassNode.id as ConfigItemClass;
                await cmdbService.createConfigItem(this.state.formId, ciClass.ID)
                    .then((configItemId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showSuccessHint();
                        DialogService.getInstance().closeMainDialog();
                        const routingConfiguration = new RoutingConfiguration(
                            null, ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
                            ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID, true
                        );
                        RoutingService.getInstance().routeToContext(routingConfiguration, configItemId);
                    }).catch((error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showError(error);
                    });
            }
        }
    }

    private showSuccessHint(): void {
        const content = new ComponentContent(
            'toast',
            new ToastContent('kix-icon-check', 'Config Item wurde erfolgreich angelegt.')
        );
        OverlayService.getInstance().openOverlay(OverlayType.SUCCESS_TOAST, null, content, '');
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

    private showError(error: any): void {
        OverlayService.getInstance().openOverlay(OverlayType.WARNING, null, new StringContent(error), 'Fehler!', true);
    }



}

module.exports = Component;
