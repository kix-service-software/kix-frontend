import { ContextService, DialogService, OverlayService } from '@kix/core/dist/browser';
import {
    ComponentContent, OverlayType, StringContent, TreeNode, ValidationResult, ValidationSeverity
} from '@kix/core/dist/model';
import { ComponentState } from './ComponentState';

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
        this.state.currentClassNode = nodes && nodes.length ? nodes[0] : null;
    }

    public cancel(): void {
        DialogService.getInstance().closeMainDialog();
    }

    public async submit(): Promise<void> {
        DialogService.getInstance().setMainDialogLoading();
        this.showSuccessHint();
        DialogService.getInstance().closeMainDialog();
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
