/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from './AbstractAction';

export class PrintAction extends AbstractAction {

    public hasLink: boolean = false;

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Print';
        this.icon = 'kix-icon-print';
    }

    public async run(event: any): Promise<void> {
        if (window) {
            window.print();
        }
    }

}
