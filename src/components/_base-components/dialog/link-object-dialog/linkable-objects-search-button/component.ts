import { FormService } from '../../../../../core/browser/form';
import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

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

        this.state.translations = await TranslationService.createTranslationObject(["Translatable#Start search"]);

        this.formListenerId = 'LinkableObjectsSearchButton';
        await FormService.getInstance().registerFormInstanceListener(this.state.formId, {
            formListenerId: this.formListenerId,
            formValueChanged: async () => {
                const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
                if (formInstance) {
                    this.state.canSearch = formInstance.hasValues();
                }
            },
            updateForm: () => { return; }
        });
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().removeFormInstanceListener(this.state.formId, this.formListenerId);
    }

    public executeSearch(): void {
        (this as any).emit('executeSearch');
    }
}

module.exports = Component;
