/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ILabelProvider } from '../../../../base-components/webapp/core/ILabelProvider';
import { Label } from '../../../../base-components/webapp/core/Label';
import { DynamicFieldTypes } from '../../../model/DynamicFieldTypes';
import { DynamicFieldValue } from '../../../model/DynamicFieldValue';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../../model/ContextMode';
import { ConfigItemProperty } from '../../../../cmdb/model/ConfigItemProperty';
import { RoutingService } from '../../../../base-components/webapp/core/RoutingService';
import { ConfigItem } from '../../../../cmdb/model/ConfigItem';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { ConfigItemClassProperty } from '../../../../cmdb/model/ConfigItemClassProperty';
import { VersionProperty } from '../../../../cmdb/model/VersionProperty';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { ConfigItemLabelProvider } from '../../../../cmdb/webapp/core';

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
            this.state.field = await KIXObjectService.loadDynamicField(this.name);
            this.createDynamicFieldInfos();
        }
    }

    private async createDynamicFieldInfos(): Promise<void> {
        if (this.state.field) {
            const dfValue = this.object.DynamicFields
                ? this.object.DynamicFields.find((dfv) => dfv.Name === this.state.field.Name)
                : null;
            if (dfValue) {
                if (this.state.field.FieldType === DynamicFieldTypes.CHECK_LIST) {
                    this.setCheckListValues(dfValue);
                } else {
                    if (this.state.field.FieldType === DynamicFieldTypes.CI_REFERENCE) {
                        this.state.labels = await ConfigItemLabelProvider.createCILabels(dfValue);
                    } else {
                        const value = this.labelProvider
                            ? await this.labelProvider.getDFDisplayValues(dfValue)
                            : dfValue;
                        if (Array.isArray(value[0])) {
                            this.state.labels = value[0].map(
                                (v, i) => new Label(null, value[2][i], null, v, null, v)
                            );
                        }
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

    public labelClicked(label: Label): void {
        if (label && label.id && this.state.field.FieldType === DynamicFieldTypes.CI_REFERENCE) {
            const routingConfig = new RoutingConfiguration(
                'config-item-details', KIXObjectType.CONFIG_ITEM, ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
            );

            RoutingService.getInstance().routeToContext(routingConfig, label.id);
        }
    }

}

module.exports = Component;
