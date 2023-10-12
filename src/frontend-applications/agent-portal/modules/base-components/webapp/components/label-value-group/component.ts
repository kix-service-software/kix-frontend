/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';

export class Component {

    private state: ComponentState;
    private minimizedGroups: number[] = [];

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.minimizedGroups = [];
    }

    public onInput(input: any): void {
        this.state.groups = input.groups ? input.groups : [];
        this.state.level = input.level ? input.level : 0;
        this.state.toggleButtonVisible = input.toggleButtonVisible !== false;
    }

    public onMount(): void {
        if (this.state.level > 8) {
            this.state.level = 8;
        }
    }

    public groupIsMinimized(groupIndex: number): boolean {
        return this.minimizedGroups.some((g) => g === groupIndex);
    }

    public minimizeGroup(groupIndex: number): void {
        if (this.state.groups[groupIndex]
            && this.state.groups[groupIndex].sub
            && Array.isArray(this.state.groups[groupIndex].sub)
            && this.state.groups[groupIndex].sub.length
        ) {
            const index = this.minimizedGroups.findIndex((g) => g === groupIndex);
            if (index !== -1) {
                this.minimizedGroups.splice(index, 1);
            } else {
                this.minimizedGroups.push(groupIndex);
            }
            (this as any).setStateDirty();
        }
    }

    public getGroupStyle(groupIndex: number): string {
        const group = this.state.groups[groupIndex];
        let columnString = `grid-template-columns: ${16 + (this.state.level * 1.75)}rem`;
        if (group
            && typeof group.value?.value !== 'undefined'
            && group.value?.value !== null
            && group.value?.value !== ''
        ) {
            columnString += ' auto';
        }
        return columnString + ';';
    }

    public fileClicked(groupIndex: number = null, attachment: any = null): void {
        if (groupIndex !== null && this.state.groups[groupIndex]) {
            (this as any).emit('fileClicked', this.state.groups[groupIndex].value.attachment);
        } else if (attachment) {
            (this as any).emit('fileClicked', attachment);
        }
    }
}

module.exports = Component;
