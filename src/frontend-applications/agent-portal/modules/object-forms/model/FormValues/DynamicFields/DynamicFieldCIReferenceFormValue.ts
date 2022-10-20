/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AutoCompleteConfiguration } from '../../../../../model/configuration/AutoCompleteConfiguration';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ConfigItemProperty } from '../../../../cmdb/model/ConfigItemProperty';
import { DynamicFieldValue } from '../../../../dynamic-fields/model/DynamicFieldValue';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { ObjectFormValueMapper } from '../../ObjectFormValueMapper';
import { ObjectFormValue } from '../ObjectFormValue';
import { SelectObjectFormValue } from '../SelectObjectFormValue';

export class DynamicFieldCIReferenceFormValue<T = number> extends SelectObjectFormValue<T> {


    public constructor(
        public property: string,
        protected object: DynamicFieldValue,
        public objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
        protected dfName: string
    ) {
        super(property, object, objectValueMapper, parent);
    }

    public findFormValue(property: string): ObjectFormValue {
        if (property === this.dfName) {
            return this;
        }

        return super.findFormValue(property);
    }

    public async initFormValue(): Promise<void> {
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);

        this.structureOption = true;
        this.objectType = KIXObjectType.CONFIG_ITEM;

        this.countDefault = 1;
        this.countMax = 1;
        this.countMin = 1;

        this.minSelectCount = Number(dynamicField?.Config?.CountMin) || 0;
        this.maxSelectCount = Number(dynamicField?.Config?.CountMax) || 1;

        if (!this.loadingOptions) {
            this.loadingOptions = new KIXObjectLoadingOptions();
        }

        if (!Array.isArray(this.loadingOptions.filter)) {
            this.loadingOptions.filter = [];
        }

        const dfFilter = [];
        if (dynamicField?.Config) {
            const classes = dynamicField.Config.ITSMConfigItemClasses;
            if (classes && Array.isArray(classes) && classes.length) {
                dfFilter.push(new FilterCriteria(
                    ConfigItemProperty.CLASS_ID, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, classes.map((c) => Number(c))
                ));
            }

            const depStates = dynamicField.Config.DeploymentStates;
            if (depStates && Array.isArray(depStates) && depStates.length) {
                dfFilter.push(new FilterCriteria(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, depStates.map((d) => Number(d))
                ));
            }
        }

        this.loadingOptions.filter.push(...dfFilter);
        this.structureOption = true;

        this.isAutoComplete = true;
        if (!this.autoCompleteConfiguration) {
            this.autoCompleteConfiguration = new AutoCompleteConfiguration();
        }

        await super.initFormValue();
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {

        // define select counts here, too (but not exclusive),
        // to init mulitselect correctly (for preset values by placeholders)
        const dynamicField = await KIXObjectService.loadDynamicField(this.dfName);
        this.minSelectCount = Number(dynamicField?.Config?.CountMin) || 0;
        this.maxSelectCount = Number(dynamicField?.Config?.CountMax) || 1;
        super.initFormValueByField(field);
    }

}