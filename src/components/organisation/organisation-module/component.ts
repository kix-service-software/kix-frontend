/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';
import { ConfiguredWidget } from '../../../core/model';
import { OrganisationContext } from '../../../core/browser/organisation';
import { KIXModulesService } from '../../../core/browser/modules';

class Component {

    public state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<OrganisationContext>(
            OrganisationContext.CONTEXT_ID
        );
        this.state.contentWidgets = context.getContent();
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }
}

module.exports = Component;
