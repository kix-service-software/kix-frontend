import {
    AbstractMarkoComponent, StandardTableFactoryService, WidgetService, ActionFactory,
    TableConfiguration, KIXObjectService, LabelService, ContextService, ServiceRegistry, SearchOperator
} from '../../../../core/browser';
import { ComponentState } from './ComponentState';
import {
    KIXObjectType, KIXObjectPropertyFilter, Translation, SortUtil, TranslationProperty,
    DataType, SortOrder, TableFilterCriteria, KIXObjectCache
} from '../../../../core/model';
import { AdminContext } from '../../../../core/browser/admin';
import { EventService, IEventSubscriber } from '../../../../core/browser/event';
import { TranslationService } from '../../../../core/browser/i18n/TranslationService';
import { RouterOutletComponent } from '../../../_base-components/router-outlet/component';

class Component extends AbstractMarkoComponent<ComponentState> implements IEventSubscriber {

    public eventSubscriberId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        this.eventSubscriberId = 'i18n-admin-translation';
    }

    public async onMount(): Promise<void> {
        const translationService = await ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION
        );

        const languages = await translationService.getLanguages();

        const filterCriteria: KIXObjectPropertyFilter[] = [];
        languages.forEach((l) => {
            filterCriteria.push(
                new KIXObjectPropertyFilter(l[1], [
                    new TableFilterCriteria(TranslationProperty.LANGUAGES, SearchOperator.EQUALS, l[0], true)
                ])
            );
            filterCriteria.push(
                new KIXObjectPropertyFilter('not ' + l[1], [
                    new TableFilterCriteria(TranslationProperty.LANGUAGES, SearchOperator.NOT_EQUALS, l[0], true)
                ])
            );
        });

        this.state.predefinedTableFilter = filterCriteria;

        this.prepareActions();

        await this.setTranslations();

        KIXObjectCache.registerCacheListener({
            cacheCleared: async (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.TRANSLATION) {
                    await this.setTranslations();
                }
            },
            objectAdded: () => { return; },
            objectRemoved: () => { return; }
        });

        EventService.getInstance().subscribe('TRANSLATION_LIST_UPDATED', this);
    }

    private async setTranslations(): Promise<void> {
        const translations = await KIXObjectService.loadObjects<Translation>(KIXObjectType.TRANSLATION);
        await this.prepareTitle(translations.length);
        await this.prepareTable(translations);
    }

    private async prepareTitle(count: number): Promise<void> {
        const context = await ContextService.getInstance().getContext<AdminContext>(AdminContext.CONTEXT_ID);
        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TRANSLATION);
        const objectName = labelProvider.getObjectName(true);
        this.state.title = `${context.categoryName}: ${objectName} (${count})`;
    }

    private async prepareTable(translations: Translation[]): Promise<void> {
        const tableConfiguration = new TableConfiguration(null, null, null, null, true);
        const table = StandardTableFactoryService.getInstance().createStandardTable(
            KIXObjectType.TRANSLATION, tableConfiguration, null, null, true
        );

        translations = SortUtil.sortObjects(
            translations, TranslationProperty.PATTERN, DataType.STRING, SortOrder.DOWN
        );

        table.layerConfiguration.contentLayer.setPreloadedObjects(translations);
        table.listenerConfiguration.selectionListener.addListener(this.setActionsDirty.bind(this));

        WidgetService.getInstance().setActionData(this.state.instanceId, table);
        await table.loadRows();
        this.state.table = table;
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe('TRANSLATION_LIST_UPDATED', this);
    }

    private prepareActions(): void {
        this.state.actions = ActionFactory.getInstance().generateActions(
            [
                'i18n-admin-translation-create',
                'i18n-admin-translation-import',
                'i18n-admin-translation-csv-export'
            ], null
        );

        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    public async filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): Promise<void> {
        if (this.state.table) {
            await this.state.table.setFilterSettings(textFilterValue, filter);
            this.state.filterCount = this.state.table.getTableRows(true).length;
            (this as any).setStateDirty('filterCount');
        }
    }

    public async eventPublished(data: any, eventId: string): Promise<void> {
        if (eventId === 'TRANSLATION_LIST_UPDATED') {
            const translations = await KIXObjectService.loadObjects<Translation>(KIXObjectType.TRANSLATION);
            await this.prepareTitle(translations.length);
            this.state.table.layerConfiguration.contentLayer.setPreloadedObjects(translations);
            await this.state.table.loadRows();
            this.state.table.listenerConfiguration.selectionListener.updateSelections(
                this.state.table.getTableRows(true)
            );
        }
    }
}

module.exports = Component;
