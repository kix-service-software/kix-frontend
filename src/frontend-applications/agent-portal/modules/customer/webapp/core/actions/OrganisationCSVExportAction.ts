/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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