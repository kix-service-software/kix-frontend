/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../model';
import { ITable } from '../ITable';
import { Table } from '../Table';

export class SwitchColumnOrderAction extends AbstractAction<ITable> {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Switch';
        this.icon = 'kix-icon-exchange';
    }

    public canRun(): boolean {
        return this.data && this.data instanceof Table;
    }

    public async run(event: any): Promise<void> {
        if (this.canRun()) {
            this.data.switchColumnOrder();
        }
    }

}
