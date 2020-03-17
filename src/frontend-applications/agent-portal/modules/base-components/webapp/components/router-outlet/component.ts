/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RouterComponentState } from './RouterComponentState';
import { RoutingService } from '../../../../../modules/base-components/webapp/core/RoutingService';
import { ComponentRouter } from '../../../../../model/ComponentRouter';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { IRoutingServiceListener } from '../../../../../modules/base-components/webapp/core/IRoutingServiceListener';

export class RouterOutletComponent implements IRoutingServiceListener {

    private state: RouterComponentState;

    public onCreate(input: any): void {
        this.state = new RouterComponentState();
    }

    public onInput(input: any): void {
        this.state.routerId = input.id;
    }

    public onMount(): void {
        RoutingService.getInstance().registerServiceListener(this);
    }

    public routedTo(router: ComponentRouter): void {
        if (router) {
            this.state.componentId = router.componentId;
            this.state.data = router.data;
            this.state.template = KIXModulesService.getComponentTemplate(this.state.componentId);
            (this as any).update();
        }
    }

}

module.exports = RouterOutletComponent;
