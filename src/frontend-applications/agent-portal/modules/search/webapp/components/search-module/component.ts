/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfigurationType } from '../../../../../model/configuration/ConfigurationType';
import { TableWidgetConfiguration } from '../../../../../model/configuration/TableWidgetConfiguration';
import { WidgetConfiguration } from '../../../../../model/configuration/WidgetConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { SearchContext } from '../../core';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext<SearchContext>();
        const searchCache = context.getSearchCache();

        this.state.icon = LabelService.getInstance().getObjectIconForType(searchCache.objectType);
        this.state.title = await this.getTitle(searchCache.objectType);

        const widgetConfiguration = new WidgetConfiguration(
            'search-result-widget-' + searchCache.name, searchCache.name, ConfigurationType.TableWidget,
            'table-widget', searchCache.name, ['bulk-action', 'csv-export-action'], null,
            new TableWidgetConfiguration('', '', null, searchCache.objectType),
            false, false, this.state.icon, true
        );

        this.state.instanceId = `search-table-${searchCache.objectType}`;
        this.state.objectType = searchCache.objectType;
        this.state.configuration = widgetConfiguration;

        this.state.prepared = true;
    }

    private async getTitle(objectType: KIXObjectType | string): Promise<string> {
        const objectName = await LabelService.getInstance().getObjectName(objectType, true);
        const title = await TranslationService.translate('Translatable#Search Results: {0}', [objectName]);
        return title;
    }
}

module.exports = Component;
