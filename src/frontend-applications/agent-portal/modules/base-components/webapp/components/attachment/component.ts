/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { Attachment } from '../../../../../model/kix/Attachment';
import { AttachmentError } from '../../../../../model/AttachmentError';
import { AttachmentUtil } from '../../../../../modules/base-components/webapp/core/AttachmentUtil';
import { ComponentContent } from '../../../../../modules/base-components/webapp/core/ComponentContent';
import { OverlayService } from '../../../../../modules/base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../modules/base-components/webapp/core/OverlayType';
import { Label } from '../../../../../modules/base-components/webapp/core/Label';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

class Component {

    public state: ComponentState;

    private dragCounter: number;

    private files: File[];
    private attachments: Attachment[];

    private options: Array<[string, any]>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.files = [];
        this.attachments = [];
        if (Array.isArray(input.value)) {
            input.value
                .filter((v) => v !== null)
                .forEach((v) => v instanceof File ? this.files.push(v) : this.attachments.push(v));
        }
        this.setCurrentValue();
        this.options = input.options;
        this.state.readonly = input.readonly;
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Select file'
        ]);

        this.dragCounter = 0;
        const uploadElement = (this as any).getEl();
        if (uploadElement) {
            uploadElement.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        } else {
            document.addEventListener('dragover', this.preventDefaultDragBehavior.bind(this), false);
        }
        document.addEventListener('dragenter', this.dragEnter.bind(this), false);
        document.addEventListener('dragleave', this.dragLeave.bind(this), false);

        if (this.options) {
            const optionMulti = this.options.find((o) => o[0] === 'MULTI_FILES');
            if (optionMulti) {
                this.state.multiple = Boolean(optionMulti[1]);
            }
            const optionMime = this.options.find((o) => o[0] === 'MimeTypes');
            if (optionMime && Array.isArray(optionMime[1]) && !!optionMime[1]) {
                this.state.accept = optionMime[1].join(',');
            }
        }
        this.setCurrentValue();
    }

    public async setCurrentValue(): Promise<void> {
        this.createLabels();
        this.state.count = this.attachments.length + this.files.length;
    }

    public async onDestroy(): Promise<void> {
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
        if (!this.state.readonly) {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }
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
            this.state.minimized = false;
        }
    }

    private async appendFiles(files: File[]): Promise<void> {
        const fileErrors: Array<[File, AttachmentError]> = [];

        const option = this.options ? this.options.find((o) => o[0] === 'MimeTypes') : null;
        const mimeTypes = option ? option[1] as string[] : null;

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

        (this as any).emit('valueChanged', [...this.attachments, ...this.files]);

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
                'Translatable#Error!',
                null,
                true
            );
        }

        (this as any).setStateDirty('files');
    }

    private dragEnter(event: any): void {
        if (!this.state.readonly) {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer.items && event.dataTransfer.items[0] && event.dataTransfer.items[0].kind === 'file') {
                this.dragCounter++;
                this.state.dragging = true;
                this.state.minimized = false;
            }
        }
    }

    private dragLeave(event: any): void {
        if (!this.state.readonly) {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer.items && event.dataTransfer.items[0] && event.dataTransfer.items[0].kind === 'file') {
                this.dragCounter--;
                if (this.dragCounter === 0) {
                    this.state.dragging = false;
                }
            }
        }
    }

    public drop(event: any): void {
        if (!this.state.readonly) {
            event.stopPropagation();
            event.preventDefault();

            if (event.dataTransfer.files) {
                const files: File[] = Array.from(event.dataTransfer.files);
                this.appendFiles(files.filter((f) => f.type !== '' || (f.size % 4096 > 0)));
            }

            this.state.dragging = false;
            this.dragCounter = 0;
        }
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    public removeFile(label: Label): void {
        if (!this.state.readonly) {
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
            (this as any).emit('valueChanged', [...this.attachments, ...this.files]);
            this.createLabels();
        }
    }

    private createLabels(): void {
        const attachmentLabels = this.attachments.map(
            (a) => new Label(
                null, a.Filename, null, a.Filename,
                `(${typeof a.FilesizeRaw !== 'undefined' ? AttachmentUtil.getFileSize(a.FilesizeRaw) : a.Filesize})`,
                a.Filename, true
            )
        );
        const fileLabels = this.files.map(
            (f) => new Label(
                null, f.name, null, f.name,
                `(${AttachmentUtil.getFileSize(f.size)})`, f.name, true
            )
        );
        this.state.labels = [...attachmentLabels, ...fileLabels];
    }
}

module.exports = Component;
