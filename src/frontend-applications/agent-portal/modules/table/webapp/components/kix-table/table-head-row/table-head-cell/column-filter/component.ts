/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../../../../../../base-components/webapp/core/ApplicationEvent';
import { ComponentContent } from '../../../../../../../base-components/webapp/core/ComponentContent';
import { EventService } from '../../../../../../../base-components/webapp/core/EventService';
import { OverlayService } from '../../../../../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../../../../../base-components/webapp/core/OverlayType';
import { Column } from '../../../../../../model/Column';
import { TableEvent } from '../../../../../../model/TableEvent';
import { TableEventData } from '../../../../../../model/TableEventData';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private column: Column;

    public onCreate(input: any): void {
        super.onCreate(input, 'kix-table/table-head-row/table-head-cell/column-filter');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.column = input.column;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        if (this.column) {
            super.registerEventSubscriber(
                function (data: TableEventData, eventId: string, subscriberId?: string): void {
                    if (data?.tableId === this.column.getTable().getTableId()) {
                        this.setActiveState();
                    }
                },
                [TableEvent.COLUMN_FILTERED]
            );
            this.setActiveState();

            const overlayIconListener = {
                overlayOpened: (): void => {
                    this.state.show = true;
                    (this as any).emit('changeFilterShownState', true);
                },
                overlayClosed: (): void => {
                    this.state.show = false;
                    (this as any).emit('changeFilterShownState', false);
                }
            };
            OverlayService.getInstance().registerOverlayListener(super.getEventSubscriberId(), overlayIconListener);
        }
    }

    public onDestroy(): void {
        super.onDestroy();
        OverlayService.getInstance().unregisterOverlayListener(this.column.getColumnId());
    }

    private setActiveState(): void {
        const filter = this.column.getFilter();
        this.state.active = ((filter[0] && filter[0] !== '') || (filter[1] && !!filter[1].length));
    }

    public async showFilter(event: any): Promise<void> {
        event.stopPropagation();
        if (this.column && !this.state.show) {

            EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);

            const content = new ComponentContent(
                'table-column-filter-overlay', { column: this.column }
            );

            let position: [number, number];
            const root = (this as any).getEl();
            if (root) {
                let cell = root.parentNode;
                while (cell && cell.className !== 'table-head-cell') {
                    cell = cell.parentNode ? cell.parentNode : null;
                }
                if (cell) {
                    const boundings: DOMRect = cell.getBoundingClientRect();
                    position = [boundings.left, boundings.bottom];
                }
            }
            OverlayService.getInstance().openOverlay(
                OverlayType.TABLE_COLUMN_FILTER, null, content, '', null, false,
                position, super.getEventSubscriberId()
            );
        } else {
            EventService.getInstance().publish(ApplicationEvent.CLOSE_OVERLAY);
            this.state.show = false;
        }
    }

    public filterEntered(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('filterHovered', true);
    }

    public filterLeaved(event): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('filterHovered', false);
    }
}

module.exports = Component;
