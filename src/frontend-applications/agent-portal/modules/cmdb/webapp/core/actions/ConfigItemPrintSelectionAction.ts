/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { Table } from '../../../../table/model/Table';
import ConfigItemPrintAction from './ConfigItemPrintAction';


export default class ConfigItemPrintSelectionAction extends ConfigItemPrintAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print selection';
        this.icon = 'kix-icon-print';
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data && this.data instanceof Table) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 0;
        }

        return canRun;
    }

    public async run(event: any): Promise<void> {

        const context = ContextService.getInstance().getActiveContext();

        if (context && this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            const versionIds = objects.map((obj) => obj.VersionID);

            const assetId = context.getObjectId();
            const printFrame: any = document.createElement('iframe');

            printFrame.src = `/cmdb/configitems/${assetId}/print` +
                (versionIds?.length > 0 ? '?versionIds=' + versionIds.join(',') : '');

            document.body.appendChild(printFrame);

            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Prepare selection for print' }
            );

            printFrame.onload = (): void => {
                setTimeout(() => {
                    window.frames[window.frames.length - 1].focus();
                    window.frames[window.frames.length - 1].print();
                    document.body.removeChild(printFrame);
                    EventService.getInstance().publish(
                        ApplicationEvent.APP_LOADING, { loading: false }
                    );
                }, 5000);
            };
        }
    }

}
