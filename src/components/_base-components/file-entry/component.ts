import { ComponentState } from './ComponentState';
import { ObjectIcon } from '@kix/core/dist/model';
import { BrowserUtil, AttachmentUtil } from '@kix/core/dist/browser';

class ArticleAttachmentComponent {

    private state: ComponentState;

    private content: string;
    private contentType: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.attachment) {
            this.state.fileName = input.attachment.Filename;
            this.state.fileSize = input.attachment.Filesize;
            this.state.icon = this.getIcon(input.attachment);
            this.content = input.attachment.Content;
            this.contentType = input.attachment.ContentType;
        } else {
            this.state.fileName = input.fileName;
            this.state.fileSize = input.fileSize;
            this.state.icon = input.icon;
        }
    }

    private getIcon(attachment: any): ObjectIcon {
        const fileName = attachment.Filename;
        const idx = fileName.lastIndexOf('.');
        if (idx >= 0) {
            const extension = fileName.substring(idx + 1, fileName.length);
            return new ObjectIcon("Filetype", extension);
        }
        return null;
    }

    public onClick(): void {
        (this as any).emit('fileClicked');
    }

}

module.exports = ArticleAttachmentComponent;
