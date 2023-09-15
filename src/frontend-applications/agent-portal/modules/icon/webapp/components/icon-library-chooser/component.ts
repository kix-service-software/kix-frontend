/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { ObjectIconService } from '../../core';
import { ObjectIcon } from '../../../model/ObjectIcon';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private iconFilterTimeout;
    private iconCount = 50;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        return;
    }

    public async onMount(): Promise<void> {
        this.iconCount = 50;
        this.setIcons();
    }

    public onDestroy(): void {
        // EventService.getInstance().unsubscribe('SOME_EVENT', this.subscriber);
    }

    public filterIcons(event: any): void {
        if (this.iconFilterTimeout) {
            clearTimeout(this.iconFilterTimeout);
        }

        this.iconFilterTimeout = setTimeout(() => {
            this.state.iconFilterValue = event.target.value;

            this.filter();
        }, 150);
    }

    public iconClicked(icon: ObjectIcon | string): void {
        (this as any).emit('iconChanged', icon);
    }

    public async toggleKIXFont(): Promise<void> {
        this.state.kixFont = !this.state.kixFont;
        this.setIcons();
    }

    public async toggleFontAwesome(): Promise<void> {
        this.state.fontAwesome = !this.state.fontAwesome;
        this.setIcons();
    }

    public async toggleKIXIcons(): Promise<void> {
        this.state.kixIcons = !this.state.kixIcons;
        this.setIcons();
    }

    public async setIcons(): Promise<void> {
        this.state.icons = await ObjectIconService.getInstance().getAvailableIcons(
            this.state.kixFont, this.state.fontAwesome, this.state.kixIcons
        );
        this.filter();
    }

    private filter(): void {
        let filterValue = this.state.iconFilterValue;
        let icons = this.state.icons;
        if (filterValue) {
            filterValue = filterValue.toLocaleLowerCase();
            icons = icons.filter((i) => {
                let match = false;

                if (typeof i === 'string') {
                    match = i.indexOf(filterValue) !== -1;
                } else if (i instanceof ObjectIcon) {
                    const objectMatch = i.Object?.toLocaleLowerCase().indexOf(filterValue) !== -1;
                    const idMatch = i.ObjectID?.toString()?.toLocaleLowerCase().indexOf(filterValue) !== -1;
                    match = objectMatch || idMatch;
                }

                return match;
            });
        }

        this.state.filteredIcons = icons.slice(0, this.iconCount);
    }

}

module.exports = Component;