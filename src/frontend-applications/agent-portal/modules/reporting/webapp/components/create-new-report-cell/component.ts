/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../table/model/Cell';
import { ReportDefinition } from '../../../model/ReportDefinition';
import { AuthenticationSocketClient } from '../../../../base-components/webapp/core/AuthenticationSocketClient';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { Report } from '../../../model/Report';
import { ReportDefinitionDialogUtil } from '../../core/ReportDefinitionDialogUtil';
import { ValidObject } from '../../../../valid/model/ValidObject';

class Component extends AbstractMarkoComponent<ComponentState> {

    private reportDefinition: ReportDefinition;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: Cell = input.cell;
            this.reportDefinition = cell.getRow().getRowObject().getObject();
            this.update();
        }
    }

    private async update(): Promise<void> {
        if (this.reportDefinition && this.reportDefinition instanceof ReportDefinition) {
            const report = new Report();
            report.DefinitionID = this.reportDefinition.ID;

            AuthenticationSocketClient.getInstance().checkPermissions([
                new UIComponentPermission(
                    'reporting/reports', [CRUD.CREATE], true, report
                )
            ]);
            this.state.show = this.reportDefinition.ValidID === ValidObject.VALID;
        }
    }

    public labelClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        ReportDefinitionDialogUtil.openCreateReportDialog(this.reportDefinition);
    }

}

module.exports = Component;
