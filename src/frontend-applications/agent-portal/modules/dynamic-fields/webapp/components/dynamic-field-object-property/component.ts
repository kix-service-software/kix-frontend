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
import { ConfigItemLabelProvider } from '../../../../cmdb/webapp/core';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TicketProperty } from '../../../../ticket/model/TicketProperty';

class Component extends AbstractMarkoComponent<ComponentState> {

    private name: string;
    private object: KIXObject;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.name = input.name;
        this.object = input.object;
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
        if (this.state.field && this.object) {
            const dfValue = this.object.DynamicFields
                ? this.object.DynamicFields.find((dfv) => dfv.Name === this.state.field.Name)
                : null;
            if (dfValue) {
                if (this.state.field.FieldType === DynamicFieldTypes.CHECK_LIST) {
                    this.setCheckListValues(dfValue);
                } else {
                    if (this.state.field.FieldType === DynamicFieldTypes.CI_REFERENCE) {
                        this.state.labels = await LabelService.getInstance().createLabelsFromDFValue(
                            this.object.KIXObjectType, dfValue
                        );
                    } else {
                        let labels = await LabelService.getInstance().createLabelsFromDFValue(
                            this.object.KIXObjectType, dfValue
                        );
                        if (!labels) {
                            const value = await LabelService.getInstance().getDFDisplayValues(
                                this.object.KIXObjectType, dfValue
                            );
                            if (Array.isArray(value[0])) {
                                labels = value[0].map((v, i) => new Label(null, value[2][i], null, v, null, v));
                            }
                        }
                        this.state.labels = labels;
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
        if (label && label.id) {
            if (this.state.field.FieldType === DynamicFieldTypes.CI_REFERENCE) {
                const routingConfig = new RoutingConfiguration(
                    'config-item-details', KIXObjectType.CONFIG_ITEM,
                    ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
                );
                RoutingService.getInstance().routeToContext(routingConfig, label.id);
            } else if (this.state.field.FieldType === DynamicFieldTypes.TICKET_REFERENCE) {
                const routingConfig = new RoutingConfiguration(
                    'ticket-details', KIXObjectType.TICKET, ContextMode.DETAILS, TicketProperty.TICKET_ID
                );
                RoutingService.getInstance().routeToContext(routingConfig, label.id);
            }
        }
    }

}

module.exports = Component;
