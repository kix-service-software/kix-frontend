/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Cell } from '../../../../table/model/Cell';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { LogFile } from '../../../model/LogFile';
import { ViewLogFileDialogContext } from '../../core/context/ViewLogFileDialogContext';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private logFile: LogFile;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell: Cell = input.cell;
        if (cell) {
            this.logFile = cell.getRow().getRowObject().getObject();
            this.state.canShow = this.logFile instanceof LogFile;
        }
    }

    public async onMount(): Promise<void> {
        this.state.title = await TranslationService.translate('Translatable#View Log File');
    }

    public async showLogViewer(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();
        ContextService.getInstance().setActiveContext(
            ViewLogFileDialogContext.CONTEXT_ID, this.logFile.ID, null, [['TIER', this.logFile.tier]]
        );
    }

}

module.exports = Component;
