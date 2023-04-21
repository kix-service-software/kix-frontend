/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { GraphContext } from '../../../../graph/webapp/core/GraphContext';
import { ConfigItemDetailsContext } from '..';
import { GraphContextOptions } from '../../../../graph/model/GraphContextOptions';

export class ConfigItemCreateGraphAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('cmdb/configitems', [CRUD.CREATE]),
        new UIComponentPermission('system/cmdb/classes', [CRUD.READ])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Show Graph';
        this.icon = 'fas fa-project-diagram';
    }

    public async canShow(): Promise<boolean> {
        const context = ContextService.getInstance().getActiveContext();
        return context?.contextId === ConfigItemDetailsContext.CONTEXT_ID;
    }

    public async run(event: any): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const additionalInformation: Array<[string, any]> = [
            [GraphContextOptions.GRAPH_REQUEST_URI, `cmdb/configitems/${context.getObjectId()}/graph`]
        ];

        ContextService.getInstance().setActiveContext(
            GraphContext.CONTEXT_ID, context.getObjectId(), null, additionalInformation
        );
    }

}
