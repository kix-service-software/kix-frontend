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

    private triggerFileUpload(): void {
        const uploadInput = (this as any).getEl('fileUploadInput');
        if (uploadInput) {
            uploadInput.click();
        }
    }

    private setAttachments(): void {
        const uploadInput = (this as any).getEl('fileUploadInput');
        if (uploadInput && uploadInput.files) {
            const files = Array.from(uploadInput.files);
            files.forEach((f: File) => {
                if (this.state.files.findIndex((sf) => sf.name === f.name) === -1) {
                    this.state.files.push(f);
                }
            });
            (this as any).setStateDirty('files');
        }
    }

}

module.exports = ArticleInputAttachmentComponent;
