/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ValueState } from './ValueState';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { LabelService } from '../LabelService';
import { Cell } from './Cell';
import { EventService } from '../EventService';
import { TableEvent } from './TableEvent';
import { IdService } from '../../../../../model/IdService';

export class TableValue {

    public constructor(
        public property: string,
        public objectValue: any,
        public displayValue: string = null,
        public state: ValueState = ValueState.NONE,
        public displayIcons: Array<ObjectIcon | string> = null,
        public instanceId = IdService.generateDateBasedId('TableValue')
    ) { }

    public async initDisplayValue(cell: Cell): Promise<void> {
        const object = cell.getRow().getRowObject().getObject();

        if (object && !this.displayValue) {
            this.displayValue = await LabelService.getInstance().getDisplayText(
                object, this.property, object[this.property], cell.getColumnConfiguration().translatable
            );
        }

        if (object && !this.displayIcons) {
            this.displayIcons = await LabelService.getInstance().getIcons(object, this.property, null, true);
        }

        EventService.getInstance().publish(TableEvent.DISPLAY_VALUE_CHANGED, this.instanceId);
    }

}
