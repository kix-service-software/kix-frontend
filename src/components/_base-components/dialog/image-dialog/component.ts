import { DialogService } from '@kix/core/dist/browser/dialog/DialogService';
import { ComponentState } from './ComponentState';
import { IImageDialogListener } from '@kix/core/dist/browser';
import { DisplayImageDescription } from '@kix/core/dist/browser/components/DisplayImageDescription';

export class Component implements IImageDialogListener {

    private state: ComponentState;
    private currImageIndex: number = 0;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerImageDialogListener(this);
    }

    public open(imageDescriptions: DisplayImageDescription[], showImageId?: string | number): void {
        this.state.show = true;
        this.state.imageDescriptions = imageDescriptions;

        this.currImageIndex = showImageId ? this.state.imageDescriptions.findIndex(
            (id) => id.imageId === showImageId
        ) : 0;
        this.state.image = this.state.imageDescriptions[this.currImageIndex];
    }

    public close(): void {
        this.state.show = false;
    }

    public previosImage(): void {
        const previosIndex = this.currImageIndex - 1;
        if (previosIndex > -1 && this.state.imageDescriptions[previosIndex]) {
            this.currImageIndex = previosIndex;
            this.state.image = this.state.imageDescriptions[this.currImageIndex];
        }
    }

    public nextImage(): void {
        const nextIndex = this.currImageIndex + 1;
        if (nextIndex <= this.state.imageDescriptions.length && this.state.imageDescriptions[nextIndex]) {
            this.currImageIndex = nextIndex;
            this.state.image = this.state.imageDescriptions[this.currImageIndex];
        }
    }
}

module.exports = Component;
