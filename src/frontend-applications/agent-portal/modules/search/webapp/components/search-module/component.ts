/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { IdService } from '../../../../../model/IdService';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { Table } from '../../../../base-components/webapp/core/table';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { SearchContext, SearchResultCategory, SearchService } from '../../core';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private resultWidgets: Array<[string, KIXObjectType | string, WidgetConfiguration, string, string | ObjectIcon]>
        = [];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.resultWidgets = [];
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        context.registerListener('search-module', {
            objectListChanged: async (objectType: KIXObjectType | string, objectList: KIXObject[]) => {
                const resultWidget = this.resultWidgets.find((rw) => rw[1] === objectType);
                if (resultWidget) {
                    const title = await this.getTitle(objectType);
                    resultWidget[3] = `${title} (${objectList?.length})`;
                }

                this.state.resultWidget = resultWidget;

                setTimeout(async () => {
                    if (objectType === context?.getSearchCache()?.objectType) {
                        const searchDefinition = SearchService.getInstance().getSearchDefinition(objectType);
                        const columns = await searchDefinition?.getTableColumnConfigurations(context?.getSearchCache());

                        const tableWidget = (this as any).getComponent('search-result-table-' + objectType);
                        const table: Table = tableWidget?.getTable();
                        table?.removeAdditonalColumns();
                        table?.addAdditionalColumns(columns);
                    }
                }, 50);
            },
            additionalInformationChanged: () => null,
            filteredObjectListChanged: () => null,
            objectChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null,
        });

        const categories = await context.getSearchResultCategories();
        await this.createTableWidgets(categories);

        const category = context.getSearchResultCategory();
        this.state.resultWidget = this.resultWidgets.find((rw) => rw[1] === category?.objectType);
    }

    private async createTableWidgets(categories: SearchResultCategory[]): Promise<void> {
        for (const category of categories) {

            const icon = LabelService.getInstance().getObjectIconForType(category.objectType);

            const widgetConfiguration = new WidgetConfiguration(
                'search-result-widget-' + category.label, category.label, ConfigurationType.TableWidget,
                'table-widget', category.label, ['bulk-action', 'csv-export-action'], null,
                new TableWidgetConfiguration('', '', null, category.objectType),
                false, false, icon, true
            );

            const title = await this.getTitle(category.objectType);

            this.resultWidgets.push(
                [IdService.generateDateBasedId(), category.objectType, widgetConfiguration, title, icon]
            );

            if (Array.isArray(category.children) && category.children.length) {
                await this.createTableWidgets(category.children);
            }
        }
    }

    private async getTitle(objectType: KIXObjectType | string): Promise<string> {
        const objectName = await LabelService.getInstance().getObjectName(objectType, true);
        const title = await TranslationService.translate('Translatable#Search Results: {0}', [objectName]);
        return title;
    }
}

module.exports = Component;
