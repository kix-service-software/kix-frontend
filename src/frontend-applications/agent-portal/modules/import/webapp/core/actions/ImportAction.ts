/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { ITable } from '../../../../base-components/webapp/core/table';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../../model/IdService';
import { ImportService } from '../';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextMode } from '../../../../../model/ContextMode';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { DialogEvents } from '../../../../../modules/base-components/webapp/core/DialogEvents';
import { DialogEventData } from '../../../../../modules/base-components/webapp/core/DialogEventData';

export class ImportAction extends AbstractAction<ITable> {

    public hasLink: boolean = false;

    public eventSubscriberId: string;
    public objectType: KIXObjectType | string;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Import';
        this.icon = 'kix-icon-import';
        this.eventSubscriberId = IdService.generateDateBasedId('import-action-');
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            this.objectType = this.data.getObjectType();
            if (ImportService.getInstance().hasImportManager(this.objectType)) {
                await this.openDialog();
            }
        }
    }

    public canRun(): boolean {
        const type = this.data ? this.data.getObjectType() : null;
        return typeof type !== 'undefined' && type !== null;
    }

    public async canShow(): Promise<boolean> {
        return ImportService.getInstance().hasImportManager(this.data.getObjectType());
    }

    private async openDialog(): Promise<void> {
        if (this.objectType) {
            const context = await ContextService.getInstance().getContextByTypeAndMode(
                this.objectType, ContextMode.IMPORT
            );
            if (context) {
                context.setDialogSubscriberId(this.eventSubscriberId);
                EventService.getInstance().subscribe(DialogEvents.DIALOG_CANCELED, this);
                EventService.getInstance().subscribe(DialogEvents.DIALOG_FINISHED, this);

                ContextService.getInstance().setDialogContext(
                    context.getDescriptor().contextId, this.objectType, ContextMode.IMPORT, null, true
                );
            }
        }
    }

    public async eventPublished(eventData: DialogEventData, eventId: string, subscriberId: string): Promise<void> {
        if (eventData && eventData.dialogId.match('import-dialog') && subscriberId === this.eventSubscriberId) {
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_CANCELED, this);
            EventService.getInstance().unsubscribe(DialogEvents.DIALOG_FINISHED, this);
        }
    }
}
