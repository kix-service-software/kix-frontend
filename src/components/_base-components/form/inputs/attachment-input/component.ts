import { ComponentState } from "./ComponentState";
import {
    ObjectIcon, AttachmentError, OverlayType, ComponentContent, FormInputComponent
} from "@kix/core/dist/model";
import { AttachmentUtil } from "@kix/core/dist/browser";
import { OverlayService } from "@kix/core/dist/browser/OverlayService";
import { Label } from "@kix/core/dist/browser/components";

class Component extends FormInputComponent<any, ComponentState> {

    private dragCounter: number;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.dragCounter = 0;
        const uploadElement = (this as any).getEl();
        if (uploadElement) {
            uploadElement.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        } else {
            document.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        }
        document.addEventListener('dragenter', this.dragEnter.bind(this), false);
        document.addEventListener('dragleave', this.dragLeave.bind(this), false);

        const option = this.state.field.options.find((o) => o.option === 'MULTI_FILES');
        if (option) {
            this.state.multiple = Boolean(option.value);
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
        const uploadInput = (this as any).getEl('fileUploadInput');
        if (uploadInput) {
            uploadInput.click();
        }
    }

    public setAttachments(): void {
        const uploadInput = (this as any).getEl('fileUploadInput');
        if (uploadInput && uploadInput.files) {
            this.appendFiles(Array.from(uploadInput.files));
        }
    }

    private appendFiles(files: File[]): void {
        const fileErrors: Array<[File, AttachmentError]> = [];

        const option = this.state.field.options.find((o) => o.option === 'MimeTypes');
        const mimeTypes = option ? option.value as string[] : null;

        if (!this.state.multiple) {
            this.state.files = [];
            files = files.length > 0 ? [files[0]] : [];
        }

        files.forEach((f: File) => {
            if (this.state.files.findIndex((sf) => sf.name === f.name) === -1) {
                const fileError = AttachmentUtil.checkFile(f, mimeTypes);
                if (fileError) {
                    fileErrors.push([f, fileError]);
                } else {
                    this.state.files.push(f);
                }
            }
        });

        super.provideValue(this.state.files);
        this.createLabels();

        if (fileErrors.length) {
            const errorMessages = AttachmentUtil.buildErrorMessages(fileErrors);
            const content = new ComponentContent('list-with-title',
                {
                    title: 'Fehler beim Hinzufügen von Anlagen:',
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
        }

        (this as any).setStateDirty('files');
    }

    private dragEnter(event: any): void {
        event.stopPropagation();
        event.preventDefault(event);
        this.dragCounter++;
        this.state.dragging = true;
        this.state.minimized = false;
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
            this.appendFiles(files.filter((f) => f.type !== '' || (f.size % 4096 > 0)));
        }

        this.state.dragging = false;
        this.dragCounter = 0;
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    private getFileIcon(file: File): ObjectIcon {
        let fileIcon = null;
        const idx = file.name.lastIndexOf('.');
        if (idx >= 0) {
            const extension = file.name.substring(idx + 1, file.name.length);
            fileIcon = new ObjectIcon("Filetype", extension);
        }
        return fileIcon;
    }

    private getFileSize(file: File): string {
        return AttachmentUtil.getFileSize(file.size);
    }

    public removeFile(label: Label): void {
        const fileIndex = this.state.files.findIndex((sf) => sf.name === label.id);
        if (fileIndex > -1) {
            this.state.files.splice(fileIndex, 1);
            this.createLabels();
        }
    }

    private createLabels(): void {
        this.state.labels = this.state.files.map(
            (f) => new Label(null, f.name, this.getFileIcon(f), f.name, `(${this.getFileSize(f)})`, f.name)
        );
    }
}

module.exports = Component;
