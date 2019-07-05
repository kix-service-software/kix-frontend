import { ComponentState } from "./ComponentState";
import { AbstractMarkoComponent } from "../../../../../../core/browser";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";

class Component extends AbstractMarkoComponent {

    public state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.update(input);

        return input;
    }

    private async update(input): Promise<void> {
        if (input.value && typeof input.value !== 'undefined') {
            this.state.value = input.value[0];
            this.state.negate = input.value[1];
        } else {
            this.state.value = '';
        }
    }

    public async onMount(): Promise<void> {
        this.state.valueTitle = await TranslationService.translate('Translatable#Pattern');
        this.state.negateTitle = await TranslationService.translate('Translatable#Negate');
    }

    public checkboxClicked(event: any): void {
        this.state.negate = event && event.target ? event.target.checked : this.state.negate;
        this.emitChanges();
    }

    public valueChanged(event: any): void {
        this.state.value = event && event.target ? event.target.value : this.state.value;
        this.emitChanges();
    }

    private emitChanges(): void {
        (this as any).emit('change', [this.state.value, this.state.negate]);
    }
}

module.exports = Component;
