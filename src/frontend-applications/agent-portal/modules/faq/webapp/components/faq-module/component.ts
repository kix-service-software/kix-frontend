/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { FAQContext } from '../../core/context/FAQContext';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext() as FAQContext;
        const widgets = await context.getContent();
        this.state.contentWidgets = widgets ? widgets.filter((w) => Boolean(w.configuration)) : [];
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

}

module.exports = Component;
