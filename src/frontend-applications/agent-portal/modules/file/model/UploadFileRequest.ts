/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IDownloadableFile } from '../../../model/IDownloadableFile';
import { ISocketRequest } from '../../base-components/webapp/core/ISocketRequest';

export class UploadFileRequest implements ISocketRequest {

    public constructor(
        public requestId: string,
        public clientRequestId: string,
        public file: IDownloadableFile
    ) { }

}