/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../model/IdService';
import { KIXObject } from '../../../model/kix/KIXObject';
import { EventService } from '../../base-components/webapp/core/EventService';
import { LabelService } from '../../base-components/webapp/core/LabelService';
import { ObjectIcon } from '../../icon/model/ObjectIcon';
import { TableEvent } from './TableEvent';
import { Cell } from './Cell';
import { ValueState } from './ValueState';

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
        await this.initDisplayText(cell);
        await this.initDisplayIcons(cell);

        EventService.getInstance().publish(TableEvent.DISPLAY_VALUE_CHANGED, this.instanceId);
    }

    public async initDisplayText(cell: Cell): Promise<void> {
        const object = cell.getRow().getRowObject<KIXObject>().getObject();

        if (!this.displayValue && cell?.getColumnConfiguration()?.showText && object) {
            this.displayValue = await LabelService.getInstance().getDisplayText(
                object, this.property, object[this.property], cell.getColumnConfiguration().translatable
            );
        }
    }

    public async initDisplayIcons(cell: Cell): Promise<void> {
        const object = cell.getRow().getRowObject<KIXObject>().getObject();

        if (!this.displayIcons && cell?.getColumnConfiguration()?.showIcon && object) {
            this.displayIcons = await LabelService.getInstance().getIcons(
                object, this.property, object[this.property], true
            );
        }
    }

}
