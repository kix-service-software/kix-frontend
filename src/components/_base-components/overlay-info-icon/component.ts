import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { IdService } from '@kix/core/dist/browser/IdService';
import { InfoOverlayWidgetData } from '@kix/core/dist/model';

import { OverlayInfoIconComponentState } from './OverlayInfoIconComponentState';
import { ComponentsService } from '@kix/core/dist/browser/components';

class OverlayInfoIconComponent {

    private state: OverlayInfoIconComponentState;

    public onCreate(input: any): void {
        this.state = new OverlayInfoIconComponentState();
    }

    public async onInput(input: any): Promise<void> {
        const content = await ComponentsService.getInstance().getComponentTemplate(input.content);
        this.state.overlayWidgetData = new InfoOverlayWidgetData(content, input.data);
    }

    public onMount(): void {
        ApplicationService.getInstance().addServiceListener(this.applicationStateChanged.bind(this));
        this.state.overlayId = IdService.generateDateBasedId('info-overlay-');
    }

    private showOverlay(event: any) {
        ApplicationService.getInstance().toggleInfoOverlay(
            this.state.overlayId,
            this.state.overlayWidgetData,
            [event.pageX, event.pageY]
        );
    }

    private applicationStateChanged() {
        this.state.show = ApplicationService.getInstance().isShowInfoOverlay(this.state.overlayId);
    }
}

module.exports = OverlayInfoIconComponent;
