/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ICell } from '../../../../../core/browser';
import { NotificationFilterManager, NotificationFilterTableProperty } from '../../../../../core/browser/notification';
import { InputFieldTypes } from '../../../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        if (input.cell) {
            const propertyCell = (input.cell as ICell).getRow().getCell(NotificationFilterTableProperty.FIELD);
            const inputType = propertyCell ? await new NotificationFilterManager().getInputType(
                propertyCell.getValue().objectValue
            ) : null;
            this.state.isLabelCell = inputType === InputFieldTypes.DROPDOWN
                || inputType === InputFieldTypes.OBJECT_REFERENCE;
        }
        this.state.cell = input.cell;
    }


}

module.exports = Component;
