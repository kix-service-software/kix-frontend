/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TableHeaderHeight } from '../../../model/TableHeaderHeight';
import { TableRowHeight } from '../../../model/TableRowHeight';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.configuration = { ...input.configuration };
        this.state.searchLimit = this.state.configuration.loadingOptions?.searchLimit;
        this.state.limit = this.state.configuration.loadingOptions?.limit;
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Some Translation']
        );
    }

    private emitConfigurationChanged(): void {
        (this as any).emit('configurationChanged', this.state.configuration);
    }

    public isSmallRows(): boolean {
        return this.state.configuration.rowHeight === TableRowHeight.SMALL;
    }

    public columnCOnfigurationChanged(columns: IColumnConfiguration[]): void {
        this.state.configuration.tableColumns = columns;
        this.emitConfigurationChanged();
    }

    public rowHeightChanged(): void {
        this.state.configuration.rowHeight = this.isSmallRows()
            ? TableRowHeight.LARGE
            : TableRowHeight.SMALL;
        this.emitConfigurationChanged();
    }

    public isSmallHeaders(): boolean {
        return this.state.configuration.headerHeight === TableHeaderHeight.SMALL;
    }

    public headerHeightChanged(): void {
        this.state.configuration.headerHeight = this.isSmallHeaders()
            ? TableHeaderHeight.LARGE
            : TableHeaderHeight.SMALL;
        this.emitConfigurationChanged();
    }

    public displayLimitChanged(event: any): void {
        this.state.configuration.displayLimit = Number(event.target.value);
        this.emitConfigurationChanged();
    }

    public searchLimitChanged(event: any): void {
        this.prepareLoadingOptions();
        const searchLimit = Number(event.target.value);
        this.state.configuration.loadingOptions.searchLimit = searchLimit > 0 ? searchLimit : null;
        this.emitConfigurationChanged();
    }

    public limitChanged(event: any): void {
        this.prepareLoadingOptions();
        const limit = Number(event.target.value);
        this.state.configuration.loadingOptions.limit = limit > 0 ? limit : null;
        this.emitConfigurationChanged();
    }

    private prepareLoadingOptions(): void {
        if (!this.state.configuration.loadingOptions) {
            this.state.configuration.loadingOptions = new KIXObjectLoadingOptions();
        }
    }

    public resultHintChanged(event: any): void {
        this.state.configuration.emptyResultHint = event.target.value;
        this.emitConfigurationChanged();
    }

    public booleanValueChanged(property: string): void {
        this.state.configuration[property] = !this.state.configuration[property];
        this.emitConfigurationChanged();
    }


}
module.exports = Component;
