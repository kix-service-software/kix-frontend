/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../base-components/webapp/core/AbstractAction';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { Table } from '../../../../base-components/webapp/core/table';


export default class ConfigItemPrintAction extends AbstractAction<Table> {

    public hasLink = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print asset';
        this.icon = 'kix-icon-print';
    }

    public async run(event: any): Promise<void> {

        const context = ContextService.getInstance().getActiveContext();

        if (context) {
            const assetId = context.getObjectId();
            const printFrame: any = document.createElement('iframe');
            printFrame.src = `/cmdb/configitems/${ assetId }/print`;
            document.body.appendChild(printFrame);

            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, {loading: true, hint: 'Translatable#Prepare asset for print'}
            );

            printFrame.onload = (): void => {
                setTimeout(() => {
                    window.frames[window.frames.length - 1].focus();
                    window.frames[window.frames.length - 1].print();
                    document.body.removeChild(printFrame);
                    EventService.getInstance().publish(
                        ApplicationEvent.APP_LOADING, {loading: false}
                    );
                }, 5000);
            };
        }
    }

}
