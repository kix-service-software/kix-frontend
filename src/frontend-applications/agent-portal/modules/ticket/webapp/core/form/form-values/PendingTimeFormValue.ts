/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { DateTimeUtil } from '../../../../../base-components/webapp/core/DateTimeUtil';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { DateTimeFormValue } from '../../../../../object-forms/model/FormValues/DateTimeFormValue';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SysConfigKey } from '../../../../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../../../../sysconfig/model/SysConfigOption';
import { Ticket } from '../../../../model/Ticket';
import { TicketProperty } from '../../../../model/TicketProperty';
import { TicketService } from '../../TicketService';

export class PendingTimeFormValue extends DateTimeFormValue {

    public constructor(
        property: string,
        ticket: Ticket,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, ticket, objectValueMapper, parent);

        ticket.addBinding(TicketProperty.STATE_ID, async (value: number) => {
            const isPending = await TicketService.isPendingState(value);
            this.enabled = isPending;
            this.visible = isPending;

            this.setNewInitialState('enabled', this.enabled);
            this.setNewInitialState('visible', this.visible);

            const date = new Date();
            let offset = 86400;
            const offsetConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_FRONTEND_PENDING_DIFF_TIME], null, null, true
            ).catch((error): SysConfigOption[] => []);

            if (Array.isArray(offsetConfig) && offsetConfig[0].Value) {
                offset = offsetConfig[0].Value;
            }
            date.setSeconds(date.getSeconds() + Number(offset));

            this.setFormValue(isPending ? DateTimeUtil.getKIXDateTimeString(date) : null);
        });
    }

    public async initFormValue(): Promise<void> {
        const isPending = await TicketService.isPendingState(this.object[TicketProperty.STATE_ID]);
        this.enabled = isPending;
        this.visible = isPending;

        this.isSortable = false;
    }

}