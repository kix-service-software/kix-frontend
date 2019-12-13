/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { KIXModulesService } from '../../../../../modules/base-components/webapp/core/KIXModulesService';
import { WidgetSize } from '../../../../../model/configuration/WidgetSize';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.widgets = input.widgets;
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

    public isLarge(widget: ConfiguredWidget): boolean {
        return widget.size === WidgetSize.LARGE;
    }

}

module.exports = Component;
