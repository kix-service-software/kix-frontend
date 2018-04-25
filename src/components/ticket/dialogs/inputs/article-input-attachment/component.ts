import { ArticleInputAttachmentComponentState } from "./ArticleInputAttachmentComponentState";
import { FormInputComponentState } from "@kix/core/dist/model";

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
        document.addEventListener("drop", this.drop.bind(this), false);
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
        files.forEach((f: File) => {
            if (this.state.files.findIndex((sf) => sf.name === f.name) === -1) {
                this.state.files.push(f);
            }
        });
        (this as any).setStateDirty('files');
    }

    private dragOver(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        this.state.dragging = true;
    }

    private drop(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const files = event.dataTransfer.files;
        this.appendFiles(Array.from(files));

        this.state.dragging = false;
    }

}

module.exports = ArticleInputAttachmentComponent;
