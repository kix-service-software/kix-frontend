/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { DynamicField } from '../../../model/DynamicField';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { DynamicFieldProperty } from '../../../model/DynamicFieldProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ILabelProvider } from '../../../../base-components/webapp/core/ILabelProvider';
import { Label } from '../../../../base-components/webapp/core/Label';
import { DynamicFieldType } from '../../../model/DynamicFieldType';
import { DynamicFieldValue } from '../../../model/DynamicFieldValue';
import { DynamicFieldFormUtil } from '../../../../base-components/webapp/core/DynamicFieldFormUtil';

class Component extends AbstractMarkoComponent<ComponentState> {

    private name: string;
    private object: KIXObject;
    private labelProvider: ILabelProvider<any>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.name = input.name;
        this.object = input.object;
        this.labelProvider = input.labelProvider;
        this.update();
    }

    public async onMount(): Promise<void> {
        this.update();
    }

    private async update(): Promise<void> {
        if (this.name && this.object) {
            this.state.field = await this.loadDynamicField(this.name);
            this.createDynamicFieldInfos();
        }
    }

    private async createDynamicFieldInfos(): Promise<void> {
        if (this.state.field) {
            const dfValue = this.object.DynamicFields
                ? this.object.DynamicFields.find((dfv) => dfv.Name === this.state.field.Name)
                : null;
            if (dfValue) {
                if (this.state.field.FieldType === DynamicFieldType.CHECK_LIST) {
                    this.setCheckListValues(dfValue);
                } else {
                    const value = this.labelProvider
                        ? await this.labelProvider.getDFDisplayValues(dfValue)
                        : dfValue;
                    if (Array.isArray(value[0]) && value[0].length > 1) {
                        this.state.labels = value[0].map(
                            (v) => new Label(null, this.state.field.Name, null, v, null, v)
                        );
                    }
                }
            }
        }
    }

    private setCheckListValues(dfValue: DynamicFieldValue): void {
        if (dfValue.Value && Array.isArray(dfValue.Value) && dfValue.Value[0]) {
            this.state.checklist = JSON.parse(dfValue.Value[0]);
        }
    }

    private async loadDynamicField(name: string): Promise<DynamicField> {
        const dynamicFields = await KIXObjectService.loadObjects<DynamicField>(
            KIXObjectType.DYNAMIC_FIELD, null,
            new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(
                        DynamicFieldProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                        FilterType.AND, name
                    )
                ], null, 1, [DynamicFieldProperty.CONFIG]
            ), null, true
        ).catch(() => [] as DynamicField[]);

        return dynamicFields && dynamicFields.length ? dynamicFields[0] : null;
    }

}

module.exports = Component;
