import { ArticleInputAttachmentComponentState } from "./ArticleInputAttachmentComponentState";
import {
    FormInputComponentState, ObjectIcon, AttachmentError, OverlayType, StringContent, ComponentContent
} from "@kix/core/dist/model";
import { AttachmentUtil } from "@kix/core/dist/browser";
import { OverlayService } from "@kix/core/dist/browser/OverlayService";

class ArticleInputAttachmentComponent {

    private state: ArticleInputAttachmentComponentState;

    public onCreate(): void {
        this.state = new ArticleInputAttachmentComponentState();
    }

    public onInput(input: FormInputComponentState): void {
        this.state.field = input.field;
        this.state.formId = input.formId;
    }

    public onMount(): void {
        document.addEventListener("dragover", this.dragOver.bind(this), false);
    }

    private triggerFileUpload(): void {
        const uploadInput = (this as any).getEl('fileUploadInput');
        if (uploadInput) {
            uploadInput.click();
        }
    }

    private setAttachments(): void {
        const uploadInput = (this as any).getEl('fileUploadInput');
        if (uploadInput && uploadInput.files) {
            this.appendFiles(Array.from(uploadInput.files));
        }
    }

    private appendFiles(files: File[]): void {
        const fileErrors: Array<[File, AttachmentError]> = [];

        files.forEach((f: File) => {
            if (this.state.files.findIndex((sf) => sf.name === f.name) === -1) {
                const fileError = AttachmentUtil.checkFile(f);
                if (fileError) {
                    fileErrors.push([f, fileError]);
                } else {
                    this.state.files.push(f);
                }
            }
        });

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

    private dragOver(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        this.state.dragging = true;
        this.state.minimized = false;
    }

    private drop(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        if (event.dataTransfer.files) {
            const files: File[] = Array.from(event.dataTransfer.files);
            this.appendFiles(files.filter((f) => f.type !== '' || (f.size % 4096 > 0)));
        }
        this.state.dragging = false;
    }

    private minimize(): void {
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

    private removeFile(file: File): void {
        const fileIndex = this.state.files.findIndex((sf) => sf.name === file.name);
        if (fileIndex > -1) {
            this.state.files.splice(fileIndex, 1);
            (this as any).setStateDirty('files');
        }
    }
}

module.exports = ArticleInputAttachmentComponent;
