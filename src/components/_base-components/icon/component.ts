import { ObjectIcon, KIXObjectType, ObjectIconLoadingOptions } from '@kix/core/dist/model';
import { ComponentState } from './ComponentState';
import { KIXObjectService } from '@kix/core/dist/browser';

class IconComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
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
            const icons = await KIXObjectService.loadObjects<ObjectIcon>(
                KIXObjectType.OBJECT_ICON, null, null,
                new ObjectIconLoadingOptions(this.state.icon.Object, this.state.icon.ObjectID)
            );
            if (icons && !!icons.length) {
                const icon = icons[0];
                if (icon.ContentType === 'text') {
                    this.state.base64 = false;
                } else {
                    this.state.base64 = true;
                    this.state.contentType = icon.ContentType;
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
