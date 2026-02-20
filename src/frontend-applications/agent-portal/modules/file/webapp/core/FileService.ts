/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from '../../../../../../server/model/rest/RequestMethod';
import { APIClient } from '../../../../api-client/APIClient';

export class FileService {

    public static async uploadFile(file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);
        await APIClient.executeRequest(RequestMethod.POST, '/files/upload', formData);
    }
}