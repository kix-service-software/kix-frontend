/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableExportUtil } from '../../../../base-components/webapp/core/table';
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
