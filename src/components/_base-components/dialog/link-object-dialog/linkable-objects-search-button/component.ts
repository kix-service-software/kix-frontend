import { FormService } from "../../../../../core/browser/form";
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;
    private formListenerId: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.formId = input.formId;
    }

    public async onMount(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            this.formListenerId = 'LinkableObjectsSearchButton';
            formInstance.registerListener({
                formListenerId: this.formListenerId,
                formValueChanged: () => {
                    this.state.canSearch = formInstance.hasValues();
                },
                updateForm: () => { return; }
            });
        }
    }

    public async onDestroy(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.removeListener('LinkableObjectsSearchButton');
        }
    }

    public executeSearch(): void {
        (this as any).emit('executeSearch');
    }
}

module.exports = Component;
