/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
