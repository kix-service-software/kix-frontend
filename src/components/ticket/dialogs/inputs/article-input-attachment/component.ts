import { ArticleInputAttachmentComponentState } from "./ArticleInputAttachmentComponentState";
import { FormInputComponentState, ObjectIcon, AttachmentError, MessageType } from "@kix/core/dist/model";
import { AttachmentUtil } from "@kix/core/dist/browser";
import { MessageOverlayService } from "@kix/core/dist/browser/application/MessageOverlayService";

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
            let message = '<b>Fehler beim Hinzufügen von Anlagen:</b>';
            message += '<ul style="margin-left: 1rem;">';
            errorMessages.forEach((e) => message += `<li>${e}</li>`);
            message += '</ul>';

            MessageOverlayService.getInstance().openMessageOverlay(
                'Fehler', message, MessageType.WARNING
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

        const files = event.dataTransfer.files;
        this.appendFiles(Array.from(files));

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
