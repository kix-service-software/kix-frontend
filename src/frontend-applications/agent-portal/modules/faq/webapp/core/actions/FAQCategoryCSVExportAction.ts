/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableExportUtil } from '../../../../table/webapp/core/TableExportUtil';
import { FAQCategoryProperty } from '../../../model/FAQCategoryProperty';
import { CSVExportAction } from '../../../../import/webapp/core/actions';

export class FAQCategoryCSVExportAction extends CSVExportAction {

    public hasLink: boolean = false;

    public async run(): Promise<void> {
        if (this.canRun()) {
            TableExportUtil.export(this.data, [FAQCategoryProperty.FULL_NAME]);
        }
    }

}
