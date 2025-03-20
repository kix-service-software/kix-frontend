/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { Table } from '../../../../table/model/Table';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { IdService } from '../../../../../model/IdService';
import { ImportService } from '../';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ContextMode } from '../../../../../model/ContextMode';

export class ImportAction extends AbstractAction<Table> {

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
            const contextDescriptor = ContextService.getInstance().getContextDescriptors(ContextMode.IMPORT);

            if (Array.isArray(contextDescriptor) && contextDescriptor.length) {

                const descriptor = contextDescriptor.find((c) => c.kixObjectTypes.some((o) => o === this.objectType));
                if (descriptor) {
                    await ContextService.getInstance().setActiveContext(descriptor.contextId);
                }
            }
        }
    }
}
