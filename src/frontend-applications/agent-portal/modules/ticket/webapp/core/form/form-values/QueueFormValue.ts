/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { QueueProperty } from '../../../../model/QueueProperty';

export class QueueFormValue extends SelectObjectFormValue<number> {

    public async initFormValue(): Promise<void> {
        if (!this.loadingOptions) {
            this.loadingOptions = new KIXObjectLoadingOptions();
        }

        if (!Array.isArray(this.loadingOptions.filter)) {
            this.loadingOptions.filter = [];
        }

        this.loadingOptions.filter.push(
            new FilterCriteria(
                QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
            )
        );

        if (!Array.isArray(this.loadingOptions.includes)) {
            this.loadingOptions.includes = [];
        }

        if (!Array.isArray(this.loadingOptions.expands)) {
            this.loadingOptions.expands = [];
        }

        this.loadingOptions.includes.push(QueueProperty.SUB_QUEUES);
        this.loadingOptions.expands.push(QueueProperty.SUB_QUEUES);

        this.structureOption = true;
        this.objectType = KIXObjectType.QUEUE;

        await super.initFormValue();
    }

}