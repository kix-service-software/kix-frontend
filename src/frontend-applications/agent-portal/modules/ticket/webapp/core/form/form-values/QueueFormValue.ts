/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { AgentSocketClient } from '../../../../../user/webapp/core/AgentSocketClient';

export class QueueFormValue extends SelectObjectFormValue<number> {

    public async initFormValue(): Promise<void> {
        if (!this.loadingOptions) {
            this.loadingOptions = new KIXObjectLoadingOptions();
        }

        if (!Array.isArray(this.loadingOptions.filter)) {
            this.loadingOptions.filter = [];
        }

        if (!Array.isArray(this.loadingOptions.includes)) {
            this.loadingOptions.includes = [];
        }

        if (!Array.isArray(this.loadingOptions.expands)) {
            this.loadingOptions.expands = [];
        }

        this.structureOption = true;
        this.objectType = KIXObjectType.QUEUE;

        await super.initFormValue();
    }

    public async loadSelectableValues(): Promise<void> {
        const user = await AgentSocketClient.getInstance().getCurrentUser(false);

        this.loadingOptions = new KIXObjectLoadingOptions();
        const requiredPermission = {
            Object: KIXObjectType.USER,
            ObjectID: user?.UserID,
            Permission: 'CREATE'
        };

        const query: [string, string][] = [
            ['requiredPermission', JSON.stringify(requiredPermission)]
        ];

        this.loadingOptions.query = query;

        await super.loadSelectableValues();
    }

}