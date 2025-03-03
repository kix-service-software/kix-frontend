/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { Context } from '../../../../../model/Context';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TableHeaderHeight } from '../../../../table/model/TableHeaderHeight';
import { TableRowHeight } from '../../../../table/model/TableRowHeight';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { IdService } from '../../../../../model/IdService';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        await this.prepareTable();
    }

    private async prepareTable(): Promise<void> {
        this.state.prepared = false;

        const contextObject = await this.context.getObject();

        const objectTitle = await LabelService.getInstance().getObjectText(contextObject);
        this.state.title = await TranslationService.translate('Translatable#Links for {0}', [objectTitle]);

        const tableConfiguration = new TableConfiguration(
            null, null, null, KIXObjectType.LINK_OBJECT, null, 25, null, [], false, false,
            null, null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
        );
        const table = await TableFactoryService.getInstance().createTable(
            `${IdService.generateDateBasedId()}-linked-objects-widget`, KIXObjectType.LINK_OBJECT, tableConfiguration,
            null, null, null, null, null, null, true
        );

        table.resetFilter();
        this.state.table = table;

        setTimeout(() => this.state.prepared = true, 10);
    }

    public filterKeyDown(event: any): void {
        if (event.keyCode === 13) {
            event.stopPropagation();
            event.preventDefault();
            const filterValue = event.target.value;
            this.state.table.setFilter(filterValue);
            this.state.table.filter();
        }
    }

}

module.exports = Component;