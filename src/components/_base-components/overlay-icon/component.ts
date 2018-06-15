import { OverlayType, ComponentContent, StringContent } from '@kix/core/dist/model';
import { OverlayIconComponentState } from './OverlayIconComponentState';
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

        this.state.instanceId = input.instanceId;
        this.state.title = input.title;
    }

    private showOverlay(event: any) {
        OverlayService.getInstance().openOverlay(
            this.state.isHintOverlay ? OverlayType.HINT : OverlayType.INFO,
            this.state.instanceId,
            this.state.content,
            this.state.title,
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
