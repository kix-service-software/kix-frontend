import { ComponentState } from "./ComponentState";
import { AbstractMarkoComponent } from "@kix/core/dist/browser";
import { ConfirmOverlayContent } from "@kix/core/dist/model";

class OverlayComponent extends AbstractMarkoComponent<ComponentState> {

    private confirmCallback: () => {} = null;
    private cancelCallback: () => {} = null;
    private buttonLabels: [string, string];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ConfirmOverlayContent): void {
        this.confirmCallback = input.confirmCallback;
        this.cancelCallback = input.cancelCallback;
        this.buttonLabels = input.buttonLabels ? input.buttonLabels : ['Ja', 'Nein'];
        this.state.text = input.text;
    }

    public closeOverlay(confirm: boolean = false): void {
        (this as any).emit('closeOverlay');
        if (confirm) {
            if (this.confirmCallback && typeof this.confirmCallback === 'function') {
                this.confirmCallback();
            }
        } else {
            if (this.cancelCallback && typeof this.cancelCallback === 'function') {
                this.cancelCallback();
            }
        }
    }

    public getButtonLabel(confirm: boolean = false): string {
        if (confirm) {
            return this.buttonLabels[0] || 'Ja';
        } else {
            return this.buttonLabels[1] || 'Nein';
        }
    }
}

module.exports = OverlayComponent;
