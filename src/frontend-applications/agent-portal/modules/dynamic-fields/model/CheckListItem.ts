/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CheckListInputType } from './CheckListInputType';
import { ChecklistState } from './ChecklistState';

export class CheckListItem {

    public id: string;

    public title: string;

    public description: string;

    public input: CheckListInputType;

    public value: string;

    public sub: CheckListItem[];

    public inputStates: ChecklistState[];

    public constructor(item: CheckListItem) {
        if (item) {
            this.id = item.id;
            this.title = item.title;
            this.description = item.description;
            this.input = item.input;
            this.value = item.value;
            this.sub = item.sub || [];
            this.inputStates = item.inputStates;
        }
    }

}
