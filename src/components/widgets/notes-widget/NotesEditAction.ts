/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from "../../../core/model";
import { Component } from './component';

export class NotesEditAction extends AbstractAction {

    public hasLink: boolean = false;

    public constructor(public component: Component) {
        super();
        this.initAction();
    }

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(event: any): Promise<void> {
        this.component.setEditorActive();
    }
}
