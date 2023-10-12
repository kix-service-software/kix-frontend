/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { DataType } from '../../../../../../../../../model/DataType';
import { ObjectIcon } from '../../../../../../../../icon/model/ObjectIcon';
import { SortUtil } from '../../../../../../../../../model/SortUtil';
import { AbstractMarkoComponent } from '../../../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { Label } from '../../../../../../../../base-components/webapp/core/Label';
import { Cell } from '../../../../../../../model/Cell';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        const cell = input.cell;
        if (cell) {
            this.setLabels(cell, input.sort);
        }
    }

    private setLabels(cell: Cell, sort: boolean = true): void {
        let values = [];
        let icons: Array<string | ObjectIcon> = [];
        const value = cell.getValue();
        if (value) {
            if (Array.isArray(value.displayValueList)) {
                values = value.displayValueList.map((v) => v.trim());
            } else if (Array.isArray(value.displayValue)) {
                values = value.displayValue.map((v) => v.trim());
            } else if (typeof value.displayValue === 'string') { // also empty string
                values = value.displayValue ? value.displayValue.split(',').map((v) => v.trim()) : [];
            } else if (typeof value.objectValue !== 'undefined' && value.objectValue !== null) {
                values = Array.isArray(value.objectValue) ? value.objectValue : [value.objectValue];
            }

            icons = value.displayIcons ? value.displayIcons : [];
        }

        values = values.map((v, index) => new Label(
            null, v,
            icons[index] ? icons[index] : null,
            v, null, v, false,
            undefined, undefined,
            value.displayClasses ? value.displayClasses[index] : null
        ));
        if (sort) {
            values = SortUtil.sortObjects(values, 'text', DataType.STRING);
        }
        this.state.cellLabels = values;
    }

}

module.exports = Component;
