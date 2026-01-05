/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { LogFile } from '../../../model/LogFile';
import { LogFileTableFactory } from '../../core/table/LogFileTableFactory';
import { IDownloadableFile } from '../../../../../model/IDownloadableFile';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'system-admin-log');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            function (data: TableEventData, eventId: string, subscriberId?: string): void {
                if (data?.tableId === LogFileTableFactory.TABLE_ID) {
                    const row = data?.table?.getRow(data.rowId);
                    const logFile = row?.getRowObject()?.getObject();
                    if (logFile instanceof LogFile) {
                        this.downloadLogFile(logFile);
                    }
                }
            },
            [TableEvent.ROW_CLICKED]
        );
    }

    private async downloadLogFile(logFile: LogFile): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions();
        loadingOptions.query = [['tier', logFile.tier]];

        const files = await KIXObjectService.loadObjects<IDownloadableFile>(
            KIXObjectType.LOG_FILE_DOWNLOAD, [logFile.ID], loadingOptions, null, false, false
        );

        if (files?.length) {
            BrowserUtil.startFileDownload(files[0]);
        }
    }


    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
