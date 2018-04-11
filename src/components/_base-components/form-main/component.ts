import { ContextService } from '@kix/core/dist/browser/context';
import { FormComponentState } from './FormularComponentState';

class FormularComponent {

    private state: FormComponentState;

    public onCreate(input: any): void {
        this.state = new FormComponentState(input.formularId);
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.formulars) {
            this.state.form = objectData.formulars.find((f) => f.id === this.state.formId);
        }
    }

}

module.exports = FormularComponent;
