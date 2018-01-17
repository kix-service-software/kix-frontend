import { ObjectInfoOverlayComponentState } from './model/ObjectInfoOverlayComponentState';

class ObjectInfoOverlayComponent {

    private state: ObjectInfoOverlayComponentState;

    public onCreate(input: any): void {
        this.state = new ObjectInfoOverlayComponentState();
    }

    public onInput(input: any): void {
        // nothing
    }

    private showOverlay() {
        this.state.show = true;
    }

    private closeOverlay() {
        this.state.show = false;
    }
}
module.exports = ObjectInfoOverlayComponent;
