/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Component } from './component';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';

export class NotesEditAction extends AbstractAction {

    public hasLink: boolean = false;

    public constructor(public component: Component) {
        super();
        this.initAction();
    }

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = 'kix-icon-edit';
    }

    public async run(event: any): Promise<void> {
        this.component.setEditorActive();
    }
}
