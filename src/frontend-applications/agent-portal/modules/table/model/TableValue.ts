/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
        public instanceId = IdService.generateDateBasedId('TableValue'),
        public displayValueList: string[] = null,
        public displayClasses: Array<string[]> = null
    ) { }

    public async initDisplayValue(cell: Cell): Promise<void> {
        await this.initDisplayText(cell);
        await this.initDisplayIcons(cell);

        EventService.getInstance().publish(TableEvent.DISPLAY_VALUE_CHANGED, this.instanceId);
    }

    public async initDisplayText(cell: Cell): Promise<void> {
        if (!this.displayValue) {
            const rowObject = cell.getRow().getRowObject<KIXObject>();
            const rowTableValue = rowObject.getValues().find(
                (v) => v.property === cell.getProperty()
            );
            if (rowTableValue?.displayValue) {
                this.displayValue = rowTableValue.displayValue;
            } else {
                const object = rowObject.getObject();
                if (!this.displayValue && object) {
                    this.displayValue = await LabelService.getInstance().getDisplayText(
                        object, this.property, object[this.property], cell.getColumnConfiguration()?.translatable
                    );
                }
            }
        }
    }

    public async initDisplayIcons(cell: Cell): Promise<void> {
        const object = cell.getRow().getRowObject<KIXObject>().getObject();

        if (!this.displayIcons && cell?.getColumnConfiguration()?.showIcon && object) {
            this.displayIcons = await LabelService.getInstance().getIcons(
                object, this.property, object[this.property], true
            );
        }

        EventService.getInstance().publish(TableEvent.DISPLAY_VALUE_CHANGED, this.instanceId);
    }

}
