import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ObjectInfoOverlayComponentState } from './model/ObjectInfoOverlayComponentState';

class ObjectInfoOverlayComponent {

    private state: ObjectInfoOverlayComponentState;

    public onCreate(input: any): void {
        this.state = new ObjectInfoOverlayComponentState();
    }

    public onMount(): void {
        ApplicationService.getInstance().addServiceListener(this.applicationStateChanged.bind(this));

        document.addEventListener("click", (event: any) => {
            if (!this.isOverlayClicked(event)) {
                if (this.state.keepShow) {
                    this.state.keepShow = false;
                } else {
                    ApplicationService.getInstance().toggleInfoOverlay();
                }
            }
        }, false);
    }

    private isOverlayClicked(event: any): boolean {
        let element = event.target;
        let found = false;
        while (element !== null) {
            if (element.attributes['infoOverlay']) {
                found = true;
                break;
            }
            element = element.parentElement;
        }
        return found;
    }

    public onUpdate(): void {
        this.positionOverlay();
    }

    private applicationStateChanged(): void {
        const showOverlay = ApplicationService.getInstance().isShowInfoOverlay();

        if (showOverlay) {
            const infoOverlay = ApplicationService.getInstance().getCurrentInfoOverlay();
            if (infoOverlay[0]) {
                this.state.content = infoOverlay[0].content;
                this.state.data = infoOverlay[0].data;
                this.state.position = infoOverlay[1];
            }

            this.state.keepShow = true;
        }

        this.state.show = showOverlay;
    }

    private positionOverlay(): void {
        const overlay = (this as any).getEl('overlay');
        if (overlay) {
            // TODO: wenn gefordert: umpositionieren, wenn außerhalb vom "bildschirm"
            if (this.state.position && this.state.position[0]) {
                // TODO: +10 vermutet, laut Preview-Screen
                overlay.style.left = (this.state.position[0] + 10) + 'px';
            } else {
                overlay.style.left = '45%';
            }
            if (this.state.position && this.state.position[1]) {
                // TODO: -112 margin-top von "section", sonst ist das overlay zu tief (egal ob clientY oder pageY)
                overlay.style.top = (this.state.position[1] - 112) + 'px';
            } else {
                overlay.style.top = '45%';
            }
        }
    }

    private closeOverlay() {
        ApplicationService.getInstance().toggleInfoOverlay();
    }

}

module.exports = ObjectInfoOverlayComponent;
