/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BrowserUtil } from '../../base-components/webapp/core/BrowserUtil';
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

    public done: boolean;

    public lastChangeDate: number;

    public showLastChangeDate: boolean;

    public constructor(item: CheckListItem) {
        if (item) {
            this.id = item.id;
            this.title = item.title;
            this.description = item.description;
            this.input = item.input;
            this.value = item.value;
            this.done = typeof item.done !== 'undefined' && item.done !== null
                ? BrowserUtil.isBooleanTrue(item.done?.toString())
                : true;
            this.showLastChangeDate = typeof item.showLastChangeDate !== 'undefined' && item.showLastChangeDate !== null
                ? BrowserUtil.isBooleanTrue(item.showLastChangeDate?.toString())
                : false;
            this.lastChangeDate = item.lastChangeDate;
            this.inputStates = item.inputStates?.map((is) => new ChecklistState(is)) || [];

            this.sub = item.sub || [];
            if (this.sub && !Array.isArray(this.sub)) {
                this.sub = [this.sub];
            }

            if (this.sub?.length) {
                this.sub = this.sub.map((s) => new CheckListItem(s));
            }
        }

    }
}
