import { ContextService } from '@kix/core/dist/browser/context';
import { FormularComponentState } from './FormularComponentState';

class FormularComponent {

    private state: FormularComponentState;

    public onCreate(input: any): void {
        this.state = new FormularComponentState(input.formularId);
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.formulars) {
            this.state.formular = objectData.formulars.find((f) => f.id === this.state.formularId);
        }
    }

}

module.exports = FormularComponent;
