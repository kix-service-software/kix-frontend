/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { TranslationPatternLabelProvider, TranslationService } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationDetailsContext } from '../../core/admin/context';
import { TranslationPattern } from '../../../model/TranslationPattern';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { WidgetService } from '../../../../../modules/base-components/webapp/core/WidgetService';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TableEvent, TableFactoryService, TableEventData } from '../../../../base-components/webapp/core/table';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectPropertyFilter } from '../../../../../model/KIXObjectPropertyFilter';
import { TableFilterCriteria } from '../../../../../model/TableFilterCriteria';
import { TranslationLanguageProperty } from '../../../model/TranslationLanguageProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';

class Component extends AbstractMarkoComponent<ComponentState> {

    public tableSubscriber: IEventSubscriber;

    public labelProvider: TranslationPatternLabelProvider;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.labelProvider = new TranslationPatternLabelProvider();
        const context = await ContextService.getInstance().getContext<TranslationDetailsContext>(
            TranslationDetailsContext.CONTEXT_ID
        );

        this.state.translation = context
            ? await context.getObject<TranslationPattern>(KIXObjectType.TRANSLATION_PATTERN)
            : null;

        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener('translation-languages-widget', {
            explorerBarToggled: () => { return; },
            filteredObjectListChanged: () => { return; },
            objectListChanged: () => { return; },
            sidebarToggled: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (ciClassId: string, translation: TranslationPattern, type: KIXObjectType) => {
                if (type === KIXObjectType.TRANSLATION_LANGUAGE) {
                    this.state.translation = translation;
                }
            },
            additionalInformationChanged: () => { return; }
        });

        await this.prepareFilter();
        await this.prepareTable();
        this.prepareActions();
        this.prepareTitle();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        TableFactoryService.getInstance().destroyTable('i18n-languages');
    }

    private prepareTitle(): void {
        const title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
        const count = this.state.table ? this.state.table.getRows(true).length : 0;
        this.state.title = `${title} (${count})`;
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'i18n-languages', KIXObjectType.TRANSLATION_LANGUAGE, null, null, TranslationDetailsContext.CONTEXT_ID, true
        );

        WidgetService.getInstance().setActionData(this.state.instanceId, table);

        this.tableSubscriber = {
            eventSubscriberId: 'translation-admin-languages-table-listener',
            eventPublished: (data: TableEventData, eventId: string) => {
                if (data && data.tableId === table.getTableId()) {
                    if (eventId === TableEvent.TABLE_READY || eventId === TableEvent.TABLE_INITIALIZED) {
                        this.state.filterCount = this.state.table.isFiltered()
                            ? this.state.table.getRows().length : null;
                        this.prepareTitle();
                    }

                    WidgetService.getInstance().updateActions(this.state.instanceId);
                }
            }
        };

        EventService.getInstance().subscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().subscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
        this.state.table = table;
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private async prepareFilter(): Promise<void> {
        const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION_PATTERN
        );
        const languages = await translationService.getLanguages();
        this.state.predefinedTableFilter = languages.map(
            (l) => new KIXObjectPropertyFilter(
                l[0], [
                new TableFilterCriteria(TranslationLanguageProperty.LANGUAGE, SearchOperator.EQUALS, l[0])
            ]
            )
        );
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            if (this.state.table) {
                this.state.table.setFilter(textFilterValue, filter ? filter.criteria : []);
                this.state.table.filter();
            }
        }
    }
}

module.exports = Component;
