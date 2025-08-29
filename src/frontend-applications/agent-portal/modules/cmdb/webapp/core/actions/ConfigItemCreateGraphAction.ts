/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
        await super.initAction();
        this.text = 'Translatable#Show Graph';
        this.icon = 'fas fa-project-diagram';
    }

    public async canShow(): Promise<boolean> {
        return this.context?.contextId === ConfigItemDetailsContext.CONTEXT_ID;
    }

    public async run(event: any): Promise<void> {
        const additionalInformation: Array<[string, any]> = [
            [GraphContextOptions.GRAPH_REQUEST_URI, `cmdb/configitems/${this.context?.getObjectId()}/graph`]
        ];

        ContextService.getInstance().setActiveContext(
            GraphContext.CONTEXT_ID, this.context?.getObjectId(), null, additionalInformation
        );
    }

}
