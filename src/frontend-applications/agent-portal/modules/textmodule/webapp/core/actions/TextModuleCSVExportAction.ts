/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TextModuleProperty } from '../../../model/TextModuleProperty';
import { CSVExportAction } from '../../../../import/webapp/core/actions/CSVExportAction';
import { TableExportUtil } from '../../../../table/webapp/core/TableExportUtil';

export class TextModuleCSVExportAction extends CSVExportAction {

    public hasLink: boolean = false;

    public async run(): Promise<void> {
        if (this.canRun()) {
            TableExportUtil.export(this.data, [TextModuleProperty.TEXT]);
        }
    }

}
