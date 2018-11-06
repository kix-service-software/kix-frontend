import { IconService } from '@kix/core/dist/browser/icon';
import { ObjectIcon } from '@kix/core/dist/model';
import { IconComponentState } from './IconComponentState';

class IconComponent {

    private state: IconComponentState;

    public onCreate(): void {
        this.state = new IconComponentState();
    }

    public onInput(input: any): void {
        this.state.icon = input.icon;
        this.state.showUnknown = typeof input.showUnknown !== 'undefined' ? input.showUnknown : false;
        this.setIcon();
    }

    public onMount(): void {
        this.setIcon();
    }

    private async setIcon(): Promise<void> {
        if (this.state.icon instanceof ObjectIcon) {
            const icon = await IconService.getInstance().getIcon(this.state.icon.Object, this.state.icon.ObjectID);
            if (icon) {
                if (icon.ContentType === 'image/svg') {
                    this.state.base64 = true;
                } else if (icon.ContentType === 'text') {
                    this.state.base64 = false;
                }
                this.state.content = icon.Content;
            } else if (this.state.showUnknown) {
                this.state.base64 = false;
                this.state.content = 'kix-icon-unknown';
            }
        } else {
            this.state.base64 = false;
            this.state.content = this.state.icon;
        }
    }

}

module.exports = IconComponent;
