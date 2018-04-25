import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { OverlayComponentState } from './OverlayComponentState';
import { WidgetType } from '@kix/core/dist/model';
import { ContextService } from '@kix/core/dist/browser/context';
import { DialogService } from '@kix/core/dist/browser/DialogService';

class ObjectInfoOverlayComponent {

    private state: OverlayComponentState;

    public onCreate(input: any): void {
        this.state = new OverlayComponentState();
    }

    public onMount(): void {
        ApplicationService.getInstance().addServiceListener(this.applicationStateChanged.bind(this));
        document.addEventListener("click", (event: any) => {
            if (ApplicationService.getInstance().isShowOverlay()) {
                if (!this.state.keepShow) {
                    ApplicationService.getInstance().toggleOverlay();
                } else {
                    this.state.keepShow = false;
                }
            }
        }, false);

        const context = ContextService.getInstance().getContext();
        if (context) {
            if (this.isHintOverlay()) {
                context.setWidgetType(this.state.instanceId, WidgetType.HINT_OVERLAY);
            } else {
                context.setWidgetType(this.state.instanceId, WidgetType.INFO_OVERLAY);
            }
        }
    }

    private overlayClicked(): void {
        this.state.keepShow = true;
    }

    public onUpdate(): void {
        this.positionOverlay();
    }

    private applicationStateChanged(): void {
        const showOverlay = ApplicationService.getInstance().isShowOverlay();

        if (showOverlay) {
            if (this.isHintOverlay()) {
                ContextService.getInstance().getContext().setWidgetType(this.state.instanceId, WidgetType.HINT_OVERLAY);
            } else {
                ContextService.getInstance().getContext().setWidgetType(this.state.instanceId, WidgetType.INFO_OVERLAY);
            }
            const overlay = ApplicationService.getInstance().getCurrentOverlay();
            if (overlay[0]) {
                this.state.content = overlay[0].content;
                this.state.data = { ...overlay[0].data, closable: true };
                this.state.position = overlay[1];
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

    private isDialogShown(): boolean {
        return DialogService.getInstance().isShowMainDialog();
    }

    private isHintOverlay(): boolean {
        return ApplicationService.getInstance().isHintOverlay();
    }

    private closeOverlay(): void {
        ApplicationService.getInstance().toggleOverlay();
    }

}

module.exports = ObjectInfoOverlayComponent;
