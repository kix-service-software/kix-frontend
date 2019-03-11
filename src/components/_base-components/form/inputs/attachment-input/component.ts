import { ComponentState } from './ComponentState';
import {
    ObjectIcon, AttachmentError, OverlayType, ComponentContent, FormInputComponent, Attachment
} from '../../../../../core/model';
import { AttachmentUtil } from '../../../../../core/browser';
import { OverlayService } from '../../../../../core/browser/OverlayService';
import { Label } from '../../../../../core/browser/components';
import { TranslationService } from '../../../../../core/browser/i18n/TranslationService';

class Component extends FormInputComponent<any, ComponentState> {

    private dragCounter: number;

    private files: File[] = [];
    private attachments: Attachment[] = [];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.files = [];
        this.attachments = [];
        this.dragCounter = 0;
        const uploadElement = (this as any).getEl();
        if (uploadElement) {
            uploadElement.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        } else {
            document.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        }
        document.addEventListener('dragenter', this.dragEnter.bind(this), false);
        document.addEventListener('dragleave', this.dragLeave.bind(this), false);

        const optionMulti = this.state.field.options.find((o) => o.option === 'MULTI_FILES');
        if (optionMulti) {
            this.state.multiple = Boolean(optionMulti.value);
        }
        const optionMime = this.state.field.options.find((o) => o.option === 'MimeTypes');
        if (optionMime && Array.isArray(optionMime.value) && !!optionMime.value) {
            this.state.accept = optionMime.value.join(',');
        }
        this.setCurrentValue();
    }

    public setCurrentValue(): void {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            if (Array.isArray(this.state.defaultValue.value)) {
                this.attachments = this.state.defaultValue.value;
            } else {
                this.attachments = [this.state.defaultValue.value];
            }
            this.createLabels();
        }
        this.state.count = this.attachments.length + this.files.length;
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
        event.preventDefault();
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

    private async appendFiles(files: File[]): Promise<void> {
        const fileErrors: Array<[File, AttachmentError]> = [];

        const option = this.state.field.options.find((o) => o.option === 'MimeTypes');
        const mimeTypes = option ? option.value as string[] : null;

        if (!this.state.multiple) {
            this.files = [];
            this.attachments = [];
            files = files.length > 0 ? [files[0]] : [];
        }

        for (const f of files) {
            if (!this.files.some((sf) => sf.name === f.name) && !this.attachments.some((a) => a.Filename === f.name)) {
                const fileError = await AttachmentUtil.checkFile(f, mimeTypes);
                if (fileError) {
                    fileErrors.push([f, fileError]);
                } else {
                    this.files.push(f);
                }
            }
        }

        this.state.count = this.attachments.length + this.files.length;

        super.provideValue([...this.attachments, ...this.files]);
        this.createLabels();

        if (fileErrors.length) {
            const errorMessages = await AttachmentUtil.buildErrorMessages(fileErrors);
            const title = await TranslationService.translate('Translatable#Error while adding the attachement:');

            const content = new ComponentContent('list-with-title',
                {
                    title,
                    list: errorMessages
                }
            );

            OverlayService.getInstance().openOverlay(
                OverlayType.WARNING,
                null,
                content,
                'Fehler!',
                true
            );
        }

        (this as any).setStateDirty('files');
    }

    private dragEnter(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.dragCounter++;
        this.state.dragging = true;
        this.state.minimized = false;
    }

    private dragLeave(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.dragCounter--;
        if (this.dragCounter === 0) {
            this.state.dragging = false;
        }
    }

    public drop(event: any): void {
        event.stopPropagation();
        event.preventDefault();

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

    private getFileIcon(mimeType: string): ObjectIcon {
        let fileIcon = null;
        const idx = mimeType.lastIndexOf('/');
        if (idx >= 0) {
            const extension = mimeType.substring(idx + 1, mimeType.length);
            fileIcon = new ObjectIcon('Filetype', extension);
        } else if (mimeType) {
            fileIcon = new ObjectIcon('Filetype', mimeType);
        }
        return fileIcon;
    }

    public removeFile(label: Label): void {
        const fileIndex = this.files.findIndex((sf) => sf.name === label.id);
        if (fileIndex !== -1) {
            this.files.splice(fileIndex, 1);
        } else {
            const attachmentIndex = this.attachments.findIndex((sf) => sf.Filename === label.id);
            if (attachmentIndex !== -1) {
                this.attachments.splice(attachmentIndex, 1);
            }
        }
        this.state.count = this.attachments.length + this.files.length;
        super.provideValue([...this.attachments, ...this.files]);
        this.createLabels();
    }

    private createLabels(): void {
        const attachmentLabels = this.attachments.map(
            (a) => new Label(
                null, a.Filename, this.getFileIcon(a.ContentType), a.Filename,
                `(${typeof a.FilesizeRaw !== 'undefined' ? AttachmentUtil.getFileSize(a.FilesizeRaw) : a.Filesize})`,
                a.Filename, true
            )
        );
        const fileLabels = this.files.map(
            (f) => new Label(
                null, f.name, this.getFileIcon(f.type), f.name,
                `(${AttachmentUtil.getFileSize(f.size)})`, f.name, true
            )
        );
        this.state.labels = [...attachmentLabels, ...fileLabels];
    }
}

module.exports = Component;
