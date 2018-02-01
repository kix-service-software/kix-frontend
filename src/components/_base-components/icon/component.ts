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
    }

    public onMount(): void {
        this.setIcon();
    }

    private async setIcon(): Promise<void> {
        const icon = await IconService.getInstance().getIcon(this.state.object, this.state.objectId);
        if (icon.ContentType === 'image/svg') {
            this.state.base64 = true;
        }

        this.state.content = icon.Content;
    }

}

module.exports = IconComponent;
