/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AttachmentUtil } from '../../../../../modules/base-components/webapp/core/AttachmentUtil';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

class ArticleAttachmentComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.attachment) {
            this.state.fileName = input.attachment.Filename;
            this.state.fileSize = typeof input.attachment.FilesizeRaw !== 'undefined' ?
                AttachmentUtil.getFileSize(input.attachment.FilesizeRaw) : input.attachment.Filesize;
            this.state.icon = this.getIcon(input.attachment);
        } else {
            this.state.fileName = input.fileName;
            this.state.fileSize = input.fileSize;
            this.state.icon = input.icon;
        }
    }

    private getIcon(attachment: any): ObjectIcon {
        const contentType = attachment.ContentType;
        if (contentType) {
            return new ObjectIcon(null, 'MIMEType', contentType);
        }
        return null;
    }

    public onClick(force: boolean): void {
        (this as any).emit('fileClicked', force);
    }

}

module.exports = ArticleAttachmentComponent;
