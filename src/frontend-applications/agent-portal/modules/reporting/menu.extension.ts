/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IMainMenuExtension } from '../../server/extensions/IMainMenuExtension';
import { ReportingContext } from './webapp/core/context/ReportingContext';
import { UIComponentPermission } from '../../model/UIComponentPermission';
import { CRUD } from '../../../../server/model/rest/CRUD';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IMainMenuExtension {

    public mainContextId: string = ReportingContext.CONTEXT_ID;

    public contextIds: string[] = [
        ReportingContext.CONTEXT_ID
    ];

    public primaryMenu: boolean = true;

    public icon: string = 'kix-icon-kpi';

    public text: string = 'Translatable#Reporting';

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('reporting/reportdefinitions', [CRUD.READ])
    ];

    public orderRang: number = 900;

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
