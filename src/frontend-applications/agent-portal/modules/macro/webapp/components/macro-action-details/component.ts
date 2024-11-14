/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { MacroAction } from '../../../model/MacroAction';
import { MacroActionLabelProvider } from '../../core/MacroActionLabelProvider';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onInput(input: any): void {
        this.createGroups(input.macroAction);
    }

    public onCreate(): void {
        this.state = new ComponentState();
    }

    private async createGroups(macroAction: MacroAction): Promise<void> {
        const labelProvider = LabelService.getInstance().getLabelProviderForType<MacroActionLabelProvider>(
            KIXObjectType.MACRO_ACTION
        );
        if (labelProvider) {
            this.state.groups = await labelProvider.getLabelValueGroups(macroAction);
        }
    }

}

module.exports = Component;
