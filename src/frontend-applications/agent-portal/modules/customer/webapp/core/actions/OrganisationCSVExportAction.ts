/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CSVExportAction } from '../../../../import/webapp/core/actions';
import { TableExportUtil } from '../../../../table/webapp/core/TableExportUtil';

export class OrganisationCSVExportAction extends CSVExportAction {

    public async run(): Promise<void> {
        TableExportUtil.export(this.data, undefined, false, false);
    }

}