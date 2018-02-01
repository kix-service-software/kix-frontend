import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { ObjectInfoOverlayComponentState } from './model/ObjectInfoOverlayComponentState';

class ObjectInfoOverlayComponent {

    private state: ObjectInfoOverlayComponentState;

    public onCreate(input: any): void {
        this.state = new ObjectInfoOverlayComponentState();
    }

    public onInput(input: any): void {
        this.state.position = input.position;
        this.positionOverlay();
    }

    public onMount(): void {
        this.positionOverlay();
    }

    private positionOverlay(): void {
        const self = (this as any).getEl('overlay');
        if (self) {
            // TODO: wenn gefordert: umpositionieren, wenn außerhalb vom "bildschirm"
            if (this.state.position && this.state.position[0]) {
                // TODO: +10 vermutet, laut Preview-Screen
                self.style.left = (this.state.position[0] + 10) + 'px';
            } else {
                self.style.left = '45%';
            }
            if (this.state.position && this.state.position[1]) {
                // TODO: -112 margin-top von "section", sonst ist das overlay zu tief (egal ob clientY oder pageY)
                self.style.top = (this.state.position[1] - 112) + 'px';
            } else {
                self.style.top = '45%';
            }
        }
    }

    private closeOverlay() {
        ApplicationStore.getInstance().toggleInfoOverlay();
    }
}
module.exports = ObjectInfoOverlayComponent;
