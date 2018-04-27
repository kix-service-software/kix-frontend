import { ApplicationService } from '@kix/core/dist/browser/application/ApplicationService';
import { ClientStorageService } from '@kix/core/dist/browser/ClientStorageService';
import { IdService } from '@kix/core/dist/browser/IdService';
import { OverlayWidgetData, OverlayType, ComponentContent, StringContent } from '@kix/core/dist/model';

import { OverlayIconComponentState } from './OverlayIconComponentState';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { OverlayService } from '@kix/core/dist/browser';

class OverlayInfoIconComponent {

    private state: OverlayIconComponentState;

    public onCreate(input: any): void {
        this.state = new OverlayIconComponentState();
    }

    public onInput(input: any): void {
        this.state.isHintOverlay = input.isHint || false;
        if (this.state.isHintOverlay) {
            this.state.content = new StringContent(input.content);
        } else {
            this.state.content = new ComponentContent(input.content, input.data);
        }
    }

    private showOverlay(event: any) {
        OverlayService.getInstance().openOverlay(
            this.state.isHintOverlay ? OverlayType.HINT : OverlayType.INFO,
            null,
            this.state.content,
            'Info',
            false,
            [event.pageX, event.pageY]
        );
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
