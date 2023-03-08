/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ConfigItemClassDefinition } from '../../../model/ConfigItemClassDefinition';

class Component extends AbstractMarkoComponent<ComponentState> {

    private definition: ConfigItemClassDefinition;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.definition = input.definition;

    }

    public async onMount(): Promise<void> {
        this.state.definitionString = this.definition ? this.definition.DefinitionString : '';
        const area = (this as any).getEl();
        if (area) {
            setTimeout(() => {
                area.style.cssText = 'height:auto; padding:0';
                area.style.cssText = 'height:' + (area.scrollHeight + 10) + 'px';
            }, 10);
        }
    }

}

module.exports = Component;
