/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
            this.setLabels(cell);
        }
    }

    private setLabels(cell: Cell): void {
        let values = [];
        let icons: Array<string | ObjectIcon> = [];
        const value = cell.getValue();
        if (value) {
            if (Array.isArray(value.displayValue)) {
                values = value.displayValue.split(',').map((v) => v.trim());
            } else if (typeof value.displayValue === 'string') {
                values = value.displayValue ? value.displayValue.split(',').map((v) => v.trim()) : [];
            } else if (typeof value.objectValue !== 'undefined' && value.objectValue !== null) {
                values = Array.isArray(value.objectValue) ? value.objectValue : [value.objectValue];
            }

            icons = value.displayIcons ? value.displayIcons : [];
        }

        this.state.cellLabels = SortUtil.sortObjects(
            values.map((v, index) => new Label(
                null, v,
                icons[index] ? icons[index] : null,
                v, null, v, false
            )),
            'text', DataType.STRING
        );
    }

}

module.exports = Component;
