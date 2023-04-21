/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { TicketState } from '../../../model/TicketState';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../../model/KIXObjectSpecificLoadingOptions';
import { TicketStateType } from '../../../model/TicketStateType';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { TicketStateProperty } from '../../../model/TicketStateProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';

export class TicketStateService extends KIXObjectService<TicketState> {

    private static INSTANCE: TicketStateService = null;

    public static getInstance(): TicketStateService {
        if (!TicketStateService.INSTANCE) {
            TicketStateService.INSTANCE = new TicketStateService();
        }

        return TicketStateService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.TICKET_STATE);
        this.objectConstructors.set(KIXObjectType.TICKET_STATE, [TicketState]);
        this.objectConstructors.set(KIXObjectType.TICKET_STATE_TYPE, [TicketStateType]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET_STATE
            || kixObjectType === KIXObjectType.TICKET_STATE_TYPE;
    }

    public getLinkObjectName(): string {
        return 'TicketState';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.TICKET_STATE) {
            objects = await super.loadObjects<O>(KIXObjectType.TICKET_STATE, null, loadingOptions);
        } else if (objectType === KIXObjectType.TICKET_STATE_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.TICKET_STATE_TYPE, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public async getStateID(stateName: string): Promise<number> {
        let stateId: number;

        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                TicketStateProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, stateName
            )
        ]);

        const states = await this.loadObjects<TicketState>(KIXObjectType.TICKET_STATE, null, loadingOptions);
        if (states?.length) {
            stateId = states[0].ID;
        }

        return stateId;
    }

}
