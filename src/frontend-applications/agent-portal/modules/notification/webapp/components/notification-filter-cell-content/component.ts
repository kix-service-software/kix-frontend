/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { Cell } from '../../../../base-components/webapp/core/table';
import { NotificationFilterTableProperty, NotificationFilterManager } from '../../core';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        if (input.cell) {
            const propertyCell = (input.cell as Cell).getRow().getCell(NotificationFilterTableProperty.FIELD);
            const inputType = propertyCell ? await NotificationFilterManager.getInstance().getInputType(
                propertyCell.getValue().objectValue
            ) : null;
            this.state.isLabelCell = inputType === InputFieldTypes.DROPDOWN
                || inputType === InputFieldTypes.OBJECT_REFERENCE;
        }
        this.state.cell = input.cell;
    }


}

module.exports = Component;
