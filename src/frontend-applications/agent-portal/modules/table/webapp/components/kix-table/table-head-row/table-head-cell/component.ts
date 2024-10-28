/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { SortOrder } from '../../../../../../../model/SortOrder';
import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../../base-components/webapp/core/BrowserUtil';
import { EventService } from '../../../../../../base-components/webapp/core/EventService';
import { IEventSubscriber } from '../../../../../../base-components/webapp/core/IEventSubscriber';
import { LabelService } from '../../../../../../base-components/webapp/core/LabelService';
import { TableEvent } from '../../../../../model/TableEvent';
import { TableEventData } from '../../../../../model/TableEventData';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    public size: number;
    private startOffset: number;

    public onCreate(input: any): void {
        this.state = new ComponentState();
        this.state.column = input.column;
        this.state.isSorted = Boolean(this.state.column.getSortOrder());
        this.state.sortOrderDown = this.isSortOrderDown();
        this.setSize();
    }

    public onInput(input: any): void {
        this.state.column = input.column;
        this.state.isSorted = Boolean(this.state.column.getSortOrder());
        this.state.sortOrderDown = this.isSortOrderDown();
        this.setIconAndTitle();
        this.setSize();

        return input;
    }

    public async onMount(): Promise<void> {
        await this.setIconAndTitle();

        this.eventSubscriberId = this.state.column.getTable().getTableId() + '-' + this.state.column.getColumnId();
        EventService.getInstance().subscribe(TableEvent.SORTED, this);

        document.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('mouseup', this.mouseup.bind(this));
    }

    public onDestroy(): void {
        document.removeEventListener('mousemove', this.mousemove.bind(this));
        document.removeEventListener('mouseup', this.mouseup.bind(this));
        EventService.getInstance().unsubscribe(TableEvent.SORTED, this);
    }

    private async setIconAndTitle(): Promise<void> {
        if (this.state.column) {
            const columnConfig = this.state.column.getColumnConfiguration();
            const table = this.state.column.getTable();
            const objectType = table ? table.getObjectType() : null;
            const objectId = [];

            if (objectType && columnConfig?.showColumnIcon) {
                this.state.icon = await LabelService.getInstance().getPropertyIcon(
                    this.state.column.getColumnId(), objectType,
                );
            }

            if (columnConfig?.defaultText) {
                this.state.title = await TranslationService.translate(
                    columnConfig.defaultText
                );
            } else {
                if (
                    objectType === KIXObjectType.CONFIG_ITEM
                    && !isNaN(Number(columnConfig['dep']))
                ) {
                    objectId.push(columnConfig['dep']);
                }
                this.state.title = await LabelService.getInstance().getPropertyText(
                    this.state.column.getColumnId(), objectType, true,
                    columnConfig.titleTranslatable, null,
                    objectId
                );
            }
        }
    }

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.SORTED
            && data
            && data.tableId && data.tableId === this.state.column.getTable().getTableId()
        ) {
            if (data.columnId && data.columnId === this.state.column.getColumnId()) {
                this.state.isSorted = true;
            } else {
                this.state.isSorted = false;
            }
            this.state.sortOrderDown = this.isSortOrderDown();
        }
    }

    private setSize(): void {
        this.size = this.state.column ? this.state.column.getColumnConfiguration().size : 100;
        const minWidth = this.getMinWidth();
        if (minWidth > this.size) {
            this.size = minWidth;
        }
        this.state.size = this.size;
    }

    private isSortOrderDown(): boolean {
        return this.state.column.getSortOrder() && this.state.column.getSortOrder() === SortOrder.DOWN;
    }

    public sort(): void {
        if (!this.state.filterIsShown) {
            if (this.state.column.getColumnConfiguration().sortable) {
                if (this.isSortOrderDown()) {
                    this.state.column.getTable().sort(this.state.column.getColumnId(), SortOrder.UP);
                } else {
                    this.state.column.getTable().sort(this.state.column.getColumnId(), SortOrder.DOWN);
                }
            }
        }
    }

    public mousedown(event: any): void {
        if (event.button === 0) {
            this.startOffset = event.pageX;
            this.state.resizeActive = true;
        }
    }

    private resizeX: number;
    private mousemove(event: any): void {
        if (this.state.resizeActive) {
            document.body.classList.add('no-select');
            if (this.resizeX !== event.pageX) {
                this.resizeX = event.pageX;
                const headerColumn = (this as any).getEl();
                this.size = headerColumn.offsetWidth + this.resizeX - this.startOffset;
                const minWidth = this.getMinWidth(headerColumn);
                if (minWidth > this.size) {
                    this.size = minWidth;
                }
                this.startOffset = this.resizeX;
                headerColumn.style.width = this.size + 'px';
            }
        }
    }

    private async mouseup(): Promise<void> {
        if (this.state.resizeActive) {
            document.body.classList.remove('no-select');
            this.startOffset = undefined;
            this.state.resizeActive = false;
            this.state.column.setSize(this.size);
            this.state.size = this.size;
        }
    }

    private browserFontSize;
    private getMinWidth(headerColumn?): number {
        if (!this.browserFontSize) {
            this.browserFontSize = BrowserUtil.getBrowserFontsize();
        }
        let minWidth: number = (2.5 * this.browserFontSize);

        if (headerColumn) {
            const minWidthString = getComputedStyle(headerColumn).getPropertyValue('min-width');
            if (minWidthString) {
                minWidth = Number(minWidthString.replace('px', ''));
            }
        }

        const config = this.state.column.getColumnConfiguration();
        if (config.showColumnIcon || config.showColumnTitle) {
            if (config.filterable) {
                minWidth += this.browserFontSize * 1.125;
            }
            if (config.sortable) {
                minWidth += this.browserFontSize * 1.125;
            }
        } else if (config.filterable && config.sortable) {
            minWidth += this.browserFontSize * 1.125;
        }

        return minWidth;
    }

    public columnFilterHovered(hover: boolean = false): void {
        this.state.filterHovered = hover;
    }

    public changeFilterShownState(shown: boolean = false): void {
        this.state.filterIsShown = shown;
    }
}

module.exports = Component;
