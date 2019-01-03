import { ComponentState } from "./ComponentState";
import { ObjectIcon, OverlayType, ComponentContent, FormInputComponent, ContextType } from "../../../../../core/model";
import { AttachmentUtil, BrowserUtil, ContextService, LabelService } from "../../../../../core/browser";
import { OverlayService } from "../../../../../core/browser/OverlayService";

class Component extends FormInputComponent<any, ComponentState> {

    private dragCounter: number;
    private mimeTypes: string[];

    public onCreate(): void {
        this.state = new ComponentState();
        this.mimeTypes = [
            'image/bmp',
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/x-icon'
        ];
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const uploadElement = (this as any).getEl();
        if (uploadElement) {
            uploadElement.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        } else {
            document.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        }
        document.addEventListener('dragenter', this.dragEnter.bind(this), false);
        document.addEventListener('dragleave', this.dragLeave.bind(this), false);

        await this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            this.state.icon = this.state.defaultValue.value;
        }
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
        const uploadElement = (this as any).getEl();
        if (uploadElement) {
            uploadElement.removeEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        } else {
            document.removeEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        }
        document.removeEventListener('dragenter', this.dragEnter.bind(this), false);
        document.removeEventListener('dragleave', this.dragLeave.bind(this), false);
    }

    private preventDefaultDragBehavior(event: any): void {
        event.stopPropagation();
        event.preventDefault(event);
        event.dataTransfer.dropEffect = 'copy';
    }

    public triggerFileUpload(): void {
        const uploadInput = (this as any).getEl('iconUploadInput');
        if (uploadInput) {
            uploadInput.click();
        }
    }

    public setIcon(): void {
        const uploadInput = (this as any).getEl('iconUploadInput');
        if (uploadInput && uploadInput.files) {
            this.checkAndSetIcon(Array.from(uploadInput.files));
        }
    }

    private async checkAndSetIcon(files: File[]): Promise<void> {
        const fileError = await AttachmentUtil.checkFile(files[0], this.mimeTypes);

        if (fileError) {
            const errorMessages = await AttachmentUtil.buildErrorMessages([[files[0], fileError]]);
            const content = new ComponentContent('list-with-title',
                {
                    title: 'Fehler beim Hinzufügen des Bildes:',
                    list: errorMessages
                }
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING,
                null,
                content,
                'Fehler',
                true
            );
        } else {
            const content = await BrowserUtil.readFile(files[0]);
            this.state.icon = new ObjectIcon(
                null, null,
                files[0].type,
                content
            );
            this.state.title = files[0].name;
            super.provideValue(this.state.icon);
        }
    }

    private dragEnter(event: any): void {
        event.stopPropagation();
        event.preventDefault(event);
        this.dragCounter++;
        this.state.dragging = true;
    }

    private dragLeave(event: any): void {
        event.stopPropagation();
        event.preventDefault(event);
        this.dragCounter--;
        if (this.dragCounter === 0) {
            this.state.dragging = false;
        }
    }

    public drop(event: any): void {
        event.stopPropagation();
        event.preventDefault(event);

        if (event.dataTransfer.files) {
            const files: File[] = Array.from(event.dataTransfer.files);
            this.checkAndSetIcon(files.filter((f) => f.type !== '' || (f.size % 4096 > 0)));
        }

        this.state.dragging = false;
        this.dragCounter = 0;
    }
}

module.exports = Component;
