import { OverlayType, ComponentContent, StringContent } from '@kix/core/dist/model';
import { ComponentState } from './ComponentState';
import { OverlayService } from '@kix/core/dist/browser';

class OverlayInfoIconComponent {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.isHintOverlay = input.isHint || false;
        if (this.state.isHintOverlay) {
            this.state.content = new StringContent(input.content);
        } else {
            this.state.content = new ComponentContent(input.content, input.data);
        }

        this.state.instanceId = input.instanceId;
        this.state.title = input.title;
    }

    public showOverlay(event: any) {
        OverlayService.getInstance().openOverlay(
            this.state.isHintOverlay ? OverlayType.HINT : OverlayType.INFO,
            this.state.instanceId,
            this.state.content,
            this.state.title,
            false,
            [event.pageX, event.pageY]
        );
    }

    public getOverlayIcon(): string {
        let icon = 'kix-icon-icircle';
        if (this.state.isHintOverlay) {
            icon = 'kix-icon-question';
        }
        return icon;
    }

}

module.exports = OverlayInfoIconComponent;
