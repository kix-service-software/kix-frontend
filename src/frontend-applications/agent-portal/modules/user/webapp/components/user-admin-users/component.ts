/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-classes-per-file */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { UserProperty } from '../../../model/UserProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { User } from '../../../model/User';
import { SortOrder } from '../../../../../model/SortOrder';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { AgentService } from '../../core/AgentService';
import { RowObject } from '../../../../table/model/RowObject';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { TableValue } from '../../../../table/model/TableValue';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;
    public filterValue: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await this.prepareTable();

        const actions = await ActionFactory.getInstance().generateActions(
            [
                'user-admin-user-create-action',
                'csv-export-action',
                'reset-user-context-widget-list'
            ], this.state.table
        );
        WidgetService.getInstance().registerActions(this.state.instanceId, actions);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Users']);

        const context = ContextService.getInstance().getActiveContext<AdminContext>();
        this.state.filterValue = context.filterValue;
        this.filterValue = context.filterValue;
        this.search();

        this.state.prepared = true;
    }

    private async prepareTable(): Promise<void> {
        this.state.table = await TableFactoryService.getInstance().createTable(
            this.state.instanceId, KIXObjectType.USER, null, [],
            null, true, null, false, false
        );

        this.state.table.setContentProvider(new UserContentProvider(this));
        this.state.table.sort(UserProperty.USER_LOGIN, SortOrder.UP);

        this.subscriber = {
            eventSubscriberId: 'admin-users',
            eventPublished: (data: TableEventData, eventId: string): void => {
                if (data && this.state.table && data.tableId === this.state.table.getTableId()) {
                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.ROW_SELECTION_CHANGED, this.subscriber);

        await this.state.table.initialize();
    }

    public keyUp(event: any): void {
        this.filterValue = event.target.value;
        if (event.key === 'Enter') {
            this.search();
        }
    }

    public search(): void {
        this.state.filterValue = this.filterValue;
        const context = ContextService.getInstance().getActiveContext();
        if (context instanceof AdminContext) {
            context.setFilterValue(this.state.filterValue);
            this.state.table.reload(true);
        }
    }

}

class UserContentProvider extends TableContentProvider {

    public constructor(private component: Component) {
        super(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, component.state.table, [], null);
    }

    public async loadData(): Promise<Array<RowObject<User>>> {
        const rowObjects = [];
        if (this.component.filterValue && this.component.filterValue !== '') {
            const filter = await AgentService.getInstance().prepareFullTextFilter(this.component.filterValue);
            const loadingOptions = new KIXObjectLoadingOptions(
                filter, null, null, [UserProperty.PREFERENCES, UserProperty.CONTACT]
            );

            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, null, loadingOptions
            );


            for (const u of users) {
                const rowObject = await this.createRowObject(u);
                rowObjects.push(rowObject);
            }
        }

        this.component.state.title = await TranslationService.translate(
            'Translatable#User Management: Users ({0})', [rowObjects.length]
        );

        return rowObjects;
    }

    private async createRowObject(user: User): Promise<RowObject> {
        const values: TableValue[] = [];

        const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
        for (const column of columns) {
            const tableValue = new TableValue(column.property, user[column.property]);
            values.push(tableValue);
        }

        const rowObject = new RowObject<User>(values, user);
        return rowObject;
    }

}

module.exports = Component;
