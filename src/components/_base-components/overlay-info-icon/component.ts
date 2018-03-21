import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { OverlayInfoIconComponentState } from './OverlayInfoIconComponentState';
import { IdService } from '@kix/core/dist/browser/IdService';
import { InfoOverlayWidgetData } from '@kix/core/dist/browser/model';
import { ClientStorageHandler } from '@kix/core/dist/browser/ClientStorageHandler';

class OverlayInfoIconComponent {

    private state: OverlayInfoIconComponentState;

    public onCreate(input: any): void {
        this.state = new OverlayInfoIconComponentState();
    }

    public onInput(input: any): void {
        const content = ClientStorageHandler.getComponentTemplate(input.content);
        this.state.overlayWidgetData = new InfoOverlayWidgetData(content);
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
        this.state.overlayId = IdService.generateDateBasedId('info-overlay-');
    }

    private showOverlay(event: any) {
        ApplicationStore.getInstance().toggleInfoOverlay(
            this.state.overlayId,
            this.state.overlayWidgetData,
            [event.pageX, event.pageY]
        );
    }

    private applicationStateChanged() {
        this.state.show = ApplicationStore.getInstance().isShowInfoOverlay(this.state.overlayId);
    }
}

module.exports = OverlayInfoIconComponent;
