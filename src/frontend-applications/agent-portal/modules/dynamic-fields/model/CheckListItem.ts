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

    public checklistStates: ChecklistState[];

    public inputStates: any;

    public constructor(item: CheckListItem) {
        if (item) {
            this.id = item.id;
            this.title = item.title;
            this.description = item.description;
            this.input = item.input;
            this.value = item.value;
            this.sub = item.sub || [];
            this.checklistStates = item.checklistStates || [];
            this.inputStates = item.inputStates;
        }

        this.mapChecklistStates();
    }

    public mapChecklistStates(): void {
        if (this.inputStates) {
            this.checklistStates = [];
            for (const key in this.inputStates) {
                if (this.inputStates[key]) {
                    const state = this.inputStates[key];
                    this.checklistStates.push(new ChecklistState(key, state.icon, state.done, state.order));
                }
            }

            delete this.inputStates;
        }

        if (this.sub?.length) {
            const subItems = [];
            for (const subItem of this.sub) {
                subItems.push(new CheckListItem(subItem));
            }

            this.sub = subItems;
        }
    }

    public mapInputStates(): void {
        if (this.checklistStates) {
            this.inputStates = {};
            for (const item of this.checklistStates) {
                this.inputStates[item.label] = {
                    order: item.order,
                    icon: item.icon,
                    done: item.done
                };
            }
        }

        if (this.sub.length) {
            for (const subItem of this.sub) {
                subItem.mapInputStates();
            }
        }
    }

}
