/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObject } from '../../../../../model/kix/KIXObject';

import { Label } from '../../../../base-components/webapp/core/Label';
import { DynamicFieldTypes } from '../../../model/DynamicFieldTypes';
import { DynamicFieldValue } from '../../../model/DynamicFieldValue';

import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

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
        if (!this.object) {
            const context = ContextService.getInstance().getActiveContext();
            const contextObject = await context.getObject();
            if (contextObject) {
                const loadedObjects = await KIXObjectService.loadObjects(
                    contextObject.KIXObjectType, [contextObject.ObjectId],
                    new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
                );
                if (Array.isArray(loadedObjects) && loadedObjects.length) {
                    this.object = loadedObjects[0];
                }
            }
        }

        if (this.name && this.object) {
            this.state.field = await KIXObjectService.loadDynamicField(this.name);
            this.createDynamicFieldInfos();
        }
    }

    private async createDynamicFieldInfos(): Promise<void> {
        if (this.state.field && this.object) {
            let dynamicFields = this.object.DynamicFields;
            if (!Array.isArray(this.object.DynamicFields) || !this.object.DynamicFields.length) {
                const objectsWithDF = await KIXObjectService.loadObjects(
                    this.object.KIXObjectType, [this.object.ObjectId],
                    new KIXObjectLoadingOptions(null, null, null, [KIXObjectProperty.DYNAMIC_FIELDS])
                );

                if (Array.isArray(objectsWithDF) && objectsWithDF.length) {
                    dynamicFields = objectsWithDF[0].DynamicFields;
                }
            }

            const dfValue = dynamicFields
                ? dynamicFields.find((dfv) => dfv.Name === this.state.field?.Name)
                : null;
            if (dfValue) {
                if (this.state.field?.FieldType === DynamicFieldTypes.CHECK_LIST) {
                    this.setCheckListValues(dfValue);
                }
                else if (this.state.field?.FieldType === DynamicFieldTypes.TABLE) {
                    this.setTableValues(dfValue);
                }
                else {
                    if (this.state.field?.FieldType === DynamicFieldTypes.CI_REFERENCE) {
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

    private setTableValues(dfValue: DynamicFieldValue): void {
        if (dfValue.Value && Array.isArray(dfValue.Value) && dfValue.Value[0]) {
            this.state.table = JSON.parse(dfValue.Value[0]);
        }
    }

    public labelClicked(label: Label): void {
        const contextMap = {};
        contextMap[DynamicFieldTypes.CI_REFERENCE] = 'config-item-details';
        contextMap[DynamicFieldTypes.TICKET_REFERENCE] = 'ticket-details';

        const contextId = contextMap[label?.id];

        if (contextId) {
            ContextService.getInstance().setActiveContext(contextId, label.id);
        }
    }

}

module.exports = Component;
