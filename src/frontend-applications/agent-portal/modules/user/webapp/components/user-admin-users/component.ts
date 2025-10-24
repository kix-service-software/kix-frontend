/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* eslint-disable max-classes-per-file */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { UserProperty } from '../../../model/UserProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { User } from '../../../model/User';
import { SortOrder } from '../../../../../model/SortOrder';
import { AdminContext } from '../../../../admin/webapp/core/AdminContext';
import { AgentService } from '../../core/AgentService';
import { RowObject } from '../../../../table/model/RowObject';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';
import { TableValue } from '../../../../table/model/TableValue';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { BackendNotification } from '../../../../../model/BackendNotification';
import { NotificationHandler } from '../../../../base-components/webapp/core/NotificationHandler';

class Component extends AbstractMarkoComponent<ComponentState> {
    public filterValue: string;

    public onCreate(input: any): void {
        super.onCreate(input, 'user-admin-users');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.prepareTable();

        const actions = await ActionFactory.getInstance().generateActions(
            [
                'user-admin-user-create-action',
                'csv-export-action',
                'reset-user-context-widget-list'
            ], this.state.table
        );
        this.context.widgetService.registerActions(this.state.instanceId, actions);

        this.state.placeholder = await TranslationService.translate('Translatable#Please enter a search term.');
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Users']);

        if (this.context instanceof AdminContext) {
            this.state.filterValue = this.context.filterValue;
            this.filterValue = this.context.filterValue;
        }
        this.search();

        super.registerEventSubscriber(
            async function (data: any, eventId: string): Promise<void> {
                let objectType = data?.objectType;
                if (!objectType && data instanceof BackendNotification) {
                    objectType = NotificationHandler.getObjectType(data.Namespace);
                }
                if (objectType === this.state.table.getObjectType()) {
                    this.search();
                }
            },
            [
                ApplicationEvent.OBJECT_CREATED,
                ApplicationEvent.OBJECT_UPDATED,
                ApplicationEvent.OBJECT_DELETED
            ]
        );

        this.state.prepared = true;
    }

    private async prepareTable(): Promise<void> {
        this.state.table = await TableFactoryService.getInstance().createTable(
            this.state.instanceId, KIXObjectType.USER, null, [],
            null, true, null, false, false
        );

        this.state.table.setContentProvider(new UserContentProvider(this));
        this.state.table.sort(UserProperty.USER_LOGIN, SortOrder.UP);

        super.registerEventSubscriber(
            function (data: TableEventData, eventId: string): void {
                if (data?.tableId === this.state.table?.getTableId()) {
                    this.context.widgetService.updateActions(this.state.instanceId);
                }
            },
            [TableEvent.ROW_SELECTION_CHANGED]
        );

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
        if (this.context instanceof AdminContext) {
            this.context.setFilterValue(this.state.filterValue);
            this.state.table.reload(true);
        }
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
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
