/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FAQContext } from '../../../core/context/FAQContext';
import { KIXObjectPropertyFilter } from '../../../../../../model/KIXObjectPropertyFilter';
import { UIFilterCriterion } from '../../../../../../model/UIFilterCriterion';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { WidgetService } from '../../../../../../modules/base-components/webapp/core/WidgetService';
import { TableFactoryService } from '../../../../../base-components/webapp/core/table';
import { KIXObject } from '../../../../../../model/kix/KIXObject';
import { ServiceRegistry } from '../../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { FAQArticleProperty } from '../../../../model/FAQArticleProperty';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { ActionFactory } from '../../../../../../modules/base-components/webapp/core/ActionFactory';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';

class Component {

    private state: ComponentState;

    private predefinedFilter: KIXObjectPropertyFilter;
    private textFilterValue: string;
    private additionalFilterCriteria: UIFilterCriterion[] = [];

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.additionalFilterCriteria = [];
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration.contextDependent) {
            context.registerListener('faq-article-list-context-listener', {
                sidebarLeftToggled: (): void => { return; },
                sidebarRightToggled: (): void => { return; },
                objectChanged: (): void => { return; },
                objectListChanged: this.contextObjectListChanged.bind(this),
                filteredObjectListChanged: (): void => { return; },
                scrollInformationChanged: () => { return; },
                additionalInformationChanged: (): void => { return; }
            });
        }

        this.prepareFilter();
        this.prepareActions();
        this.prepareTable();
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        TableFactoryService.getInstance().destroyTable('faq-articles');
    }

    private async contextObjectListChanged(objectList: KIXObject[]): Promise<void> {
        if (this.state.table) {
            this.setTitle(objectList.length);
            this.setActionsDirty();
        }
    }

    private async prepareFilter(): Promise<void> {
        const translationService = ServiceRegistry.getServiceInstance<TranslationService>(
            KIXObjectType.TRANSLATION_PATTERN
        );
        const languages = await translationService.getLanguages();
        this.state.predefinedTableFilter = languages.map(
            (l) => new KIXObjectPropertyFilter(
                l[1], [new UIFilterCriterion(FAQArticleProperty.LANGUAGE, SearchOperator.EQUALS, l[0])]
            )
        );
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, null
            );
        }
        WidgetService.getInstance().registerActions(this.state.instanceId, this.state.actions);
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'faq-articles', KIXObjectType.FAQ_ARTICLE, null, null, FAQContext.CONTEXT_ID
        );

        this.state.table = table;

        const context = ContextService.getInstance().getActiveContext() as FAQContext;
        this.setCategoryFilter(context.categoryId);
        if (this.state.widgetConfiguration.contextDependent && context) {
            const objects = await context.getObjectList(KIXObjectType.FAQ_ARTICLE);
            this.setTitle(objects.length);
        }
    }

    private setActionsDirty(): void {
        WidgetService.getInstance().updateActions(this.state.instanceId);
    }

    private setTitle(count: number = 0): void {
        let title = this.state.widgetConfiguration ? this.state.widgetConfiguration.title : '';
        if (this.state.table) {
            title = `${title} (${count})`;
        }
        this.state.title = title;
    }

    public filter(textFilterValue?: string, filter?: KIXObjectPropertyFilter): void {
        if (this.state.table) {
            this.predefinedFilter = filter;
            this.textFilterValue = textFilterValue;

            const predefinedCriteria = this.predefinedFilter ? this.predefinedFilter.criteria : [];
            const newFilter = [...predefinedCriteria, ...this.additionalFilterCriteria];

            this.state.table.setFilter(textFilterValue, newFilter);
            this.state.table.filter();
        }
    }

    private setCategoryFilter(categoryId: number): void {
        this.additionalFilterCriteria = [];

        if (categoryId) {
            this.additionalFilterCriteria = [
                new UIFilterCriterion(FAQArticleProperty.CATEGORY_ID, SearchOperator.EQUALS, categoryId)
            ];
        }

        if (!this.predefinedFilter) {
            this.predefinedFilter = new KIXObjectPropertyFilter('FAQ Kategorie', []);
        }

        this.filter(this.textFilterValue, this.predefinedFilter);
    }

}

module.exports = Component;
