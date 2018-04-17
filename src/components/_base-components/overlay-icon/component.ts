import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { IdService } from '@kix/core/dist/browser/IdService';
import { OverlayWidgetData } from '@kix/core/dist/model';

import { OverlayIconComponentState } from './OverlayIconComponentState';
import { ComponentsService } from '@kix/core/dist/browser/components';

class OverlayInfoIconComponent {

    private state: OverlayIconComponentState;

    public onCreate(input: any): void {
        this.state = new OverlayIconComponentState();
    }

    public onInput(input: any): void {
        const content = ComponentsService.getInstance().getComponentTemplate(input.content);
        this.state.overlayWidgetData = new OverlayWidgetData(content, input.data);
        this.state.isHintOverlay = input.isHint || false;
    }

    public onMount(): void {
        ApplicationService.getInstance().addServiceListener(this.applicationStateChanged.bind(this));
        this.state.overlayId = IdService.generateDateBasedId('overlay-');
    }

    private showOverlay(event: any) {
        ApplicationService.getInstance().toggleOverlay(
            this.state.overlayId,
            this.state.overlayWidgetData,
            [event.pageX, event.pageY],
            this.state.isHintOverlay ? true : false
        );
    }

    private applicationStateChanged() {
        this.state.show = ApplicationService.getInstance().isShowOverlay(this.state.overlayId);
    }

    private getOverlayIcon(): string {
        let icon = 'kix-icon-icircle';
        if (this.state.isHintOverlay) {
            // TODO: wird wahrscheinlich mal klein geschrieben
            icon = 'kix-icon-Question';
        }
        return icon;
    }
}

module.exports = OverlayInfoIconComponent;
