/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ObjectFormEvent } from '../../../model/ObjectFormEvent';
import { ComponentState } from './ComponentState';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Context } from '../../../../../model/Context';
import { RowLayout } from '../../../model/layout/RowLayout';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { PageRowLayout } from './PageRowLayout';
import { FormGroupConfiguration } from '../../../../../model/configuration/FormGroupConfiguration';
import { ObjectFormHandler } from '../../core/ObjectFormHandler';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;
    private contextInstanceId: string;
    private context: Context;
    private page: FormPageConfiguration;
    private formHandler: ObjectFormHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.contextInstanceId = input.contextInstanceId;
        this.page = input.page;
    }

    public async onMount(): Promise<void> {
        if (this.contextInstanceId) {
            this.context = ContextService.getInstance().getContext(this.contextInstanceId);
        } else {
            this.context = ContextService.getInstance().getActiveContext();
        }

        this.formHandler = await this.context?.getFormManager()?.getObjectFormHandler();

        await this.prepareRowLayout();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('object-form-group'),
            eventPublished: async (data: Context | any, eventId: string): Promise<void> => {
                this.state.prepared = false;

                this.page = this.formHandler.form.pages.find((p) => p.id === this.page?.id);

                this.state.active = this.formHandler?.activePageId === this.page?.id;

                if (this.state.active) {
                    await this.prepareRowLayout();
                }

                setTimeout(() => this.state.prepared = true, 10);
            }
        };

        this.state.active = this.formHandler?.activePageId === this.page?.id;

        EventService.getInstance().subscribe(ObjectFormEvent.GROUP_ADDED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.GROUP_DELETED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.PAGE_CHANGED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.PAGE_UPDATED, this.subscriber);
        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ObjectFormEvent.GROUP_ADDED, this.subscriber);
        EventService.getInstance().subscribe(ObjectFormEvent.GROUP_DELETED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.PAGE_CHANGED, this.subscriber);
        EventService.getInstance().unsubscribe(ObjectFormEvent.PAGE_UPDATED, this.subscriber);
    }

    private async prepareRowLayout(): Promise<void> {
        const form = await this.context.getFormManager().getForm();
        const pageRowLayout = form.formLayout?.rowLayout?.find((rl) => rl.pageId === this.page?.id);
        if (pageRowLayout?.rows?.length) {
            this.state.rows = this.mapRows(pageRowLayout);
        } else {
            this.state.rows = [[new PageRowLayout(this.page?.groups, 12, 12, 12)]];
        }
    }

    private mapRows(pageRowLayout: RowLayout): Array<PageRowLayout[]> {
        const rows: Array<PageRowLayout[]> = [];
        const mappedGroupIds: string[] = [];
        for (const columns of pageRowLayout.rows) {
            const rowColumns = [];
            if (columns?.length) {
                for (const col of columns) {
                    const groups = col.formObjectIds?.map((gid) => this.page?.groups?.find((g) => g.id === gid));
                    mappedGroupIds.push(...col.formObjectIds);
                    rowColumns.push(new PageRowLayout(groups, col.colSM, col.colMD, col.colLG));
                }
            }

            if (rowColumns.length) {
                rows.push(rowColumns);
            }
        }

        const notMappedGroups: FormGroupConfiguration[] = [];
        for (const g of this.page?.groups || []) {
            if (!mappedGroupIds.some((gid) => g.id === gid)) {
                notMappedGroups.push(g);
            }
        }

        if (notMappedGroups.length) {
            rows.push([new PageRowLayout(notMappedGroups, 12, 12, 12)]);
        }

        return rows;
    }

    public getColumnClasses(column: PageRowLayout): string {
        let classes = [];

        if (column?.colSM > 0) {
            classes.push('col-sm-' + (column.colSM < 3 ? 3 : column.colSM));
        }

        if (column?.colMD > 0) {
            classes.push('col-md-' + (column.colMD < 3 ? 3 : column.colMD));
        }

        if (column?.colLG > 0) {
            classes.push('col-lg-' + (column.colLG < 3 ? 3 : column.colLG));
        }

        if (!classes.length) {
            classes.push('col-12');
        }

        return classes.join(' ');
    }

}

module.exports = Component;