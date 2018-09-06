import {
    ContextService, DialogService, OverlayService, FormService, KIXObjectServiceRegistry
} from '@kix/core/dist/browser';
import {
    ComponentContent, OverlayType, StringContent, TreeNode, ValidationResult,
    ValidationSeverity, ConfigItemClass, KIXObjectType, ContextMode
} from '@kix/core/dist/model';
import { ComponentState } from './ComponentState';
import { CMDBService } from '@kix/core/dist/browser/cmdb';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData.configItemClasses) {
            this.state.classNodes = objectData.configItemClasses.map(
                (ci) => new TreeNode(ci, ci.Name)
            );
        }
    }

    public classChanged(nodes: TreeNode[]): void {
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
            FormService.getInstance().getFormInstance(formId, false);
        }

        setTimeout(() => {
            this.state.formId = formId;
            DialogService.getInstance().setMainDialogLoading(false);
        }, 100);
    }

    public cancel(): void {
        if (this.state.formId) {
            const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
            formInstance.reset();
        }
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        if (this.state.formId) {

            const formInstance = FormService.getInstance().getFormInstance(this.state.formId);
            const result = formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);

            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, 'Config Item wird angelegt');
                const service = KIXObjectServiceRegistry.getInstance().getServiceInstance(KIXObjectType.CONFIG_ITEM);
                const cmdbService = (service as CMDBService);

                const ciClass = this.state.currentClassNode.id as ConfigItemClass;
                await cmdbService.createConfigItem(this.state.formId, ciClass.ID)
                    .then((configItemId) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showSuccessHint();
                        DialogService.getInstance().closeMainDialog();
                        ContextService.getInstance().setContext(
                            null, KIXObjectType.CONFIG_ITEM, ContextMode.DETAILS, configItemId
                        );
                    }).catch((error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        this.showError(error);
                    });
            }
        }
    }

    private showSuccessHint(): void {
        const content = new ComponentContent('list-with-title', {
            title: 'Config Item wurde erfolgreich angelegt.',
            list: [],
            icon: 'kix-icon-check'
        });
        OverlayService.getInstance().openOverlay(OverlayType.TOAST, null, content, '');
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
