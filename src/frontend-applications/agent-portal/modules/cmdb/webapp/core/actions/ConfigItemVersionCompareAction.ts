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
import { Version } from '../../../model/Version';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { CompareConfigItemVersionContext } from '../context';

export class ConfigItemVersionCompareAction extends AbstractAction<Table> {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Compare';
        this.icon = 'kix-icon-comparison-version';
    }

    public canRun(): boolean {
        let canRun = false;
        if (this.data && this.data instanceof Table) {
            const rows = this.data.getSelectedRows();
            canRun = rows && rows.length > 1;
        }

        return canRun;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            const rows = this.data.getSelectedRows();
            const objects = rows.map((r) => r.getRowObject().getObject());
            await this.openDialog(objects);
        }
    }

    private async openDialog(versions: Version[]): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        const additionalInformation: Array<[string, any]> = [
            ['VERSION_IDS', versions.map((v) => v.VersionID)]
        ];

        await ContextService.getInstance().setActiveContext(
            CompareConfigItemVersionContext.CONTEXT_ID, context?.getObjectId(), null, additionalInformation
        );
    }
}
