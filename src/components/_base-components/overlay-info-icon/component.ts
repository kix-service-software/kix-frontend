import { ApplicationStore } from '@kix/core/dist/browser/application/ApplicationStore';
import { OverlayInfoIconComponentState } from './OverlayInfoIconComponentState';
import { IdService } from '@kix/core/dist/browser/IdService';

class OverlayInfoIconComponent {

    private state: OverlayInfoIconComponentState;

    public onCreate(input: any): void {
        this.state = new OverlayInfoIconComponentState();
    }

    public onInput(input: any): void {
        this.state.title = input.title;
        this.state.content = input.content;
    }

    public onMount(): void {
        ApplicationStore.getInstance().addStateListener(this.applicationStateChanged.bind(this));
        this.state.id = IdService.generateDateBasedId('info-overlay-');
    }

    private showOverlay(event: any) {
        let position: [number, number] = [event.pageX, event.pageY];
        const self = (this as any).getEl('overlay-info-icon');
        if (self) {
            position = [
                self.getBoundingClientRect().left + self.getBoundingClientRect().width + window.scrollX,
                self.getBoundingClientRect().top - 2 + window.scrollY
            ];
        }
        ApplicationStore.getInstance().toggleInfoOverlay(
            this.state.id,
            this.state.title,
            this.state.content,
            position
        );
    }

    private applicationStateChanged() {
        this.state.show = ApplicationStore.getInstance().isShowInfoOverlay(this.state.id);
    }
}
module.exports = OverlayInfoIconComponent;
