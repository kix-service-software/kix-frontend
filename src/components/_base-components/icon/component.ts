import { IconService } from '@kix/core/dist/browser/icon';

class IconComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            object: null,
            objectId: null,
            base64: false,
            content: null
        };
    }

    public onInput(input: any): void {
        this.state.object = input.object;
        this.state.objectId = input.objectId;
        this.setIcon();
    }

    public onMount(): void {
        this.setIcon();
    }

    private async setIcon(): Promise<void> {
        if (this.state.object && this.state.objectId) {
            const icon = await IconService.getInstance().getIcon(this.state.object, this.state.objectId);
            if (icon) {
                if (icon.ContentType === 'image/svg') {
                    this.state.base64 = true;
                } else if (icon.ContentType === 'text') {
                    this.state.base64 = false;
                }
                this.state.content = icon.Content;
            } else {
                this.state.base64 = false;
                this.state.content = 'kix-icon-minus';
            }
        }
    }

}

module.exports = IconComponent;
