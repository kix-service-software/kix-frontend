/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { ExtendedLabelProvider } from './ExtendedLabelProvider';
import { KIXObjectService } from './KIXObjectService';
import { Label } from './Label';
import { LabelService } from './LabelService';

export class ObjectReferenceLabelProvider extends ExtendedLabelProvider {

    public isLabelProviderForDFType(dfFieldType: string): boolean {
        return false;
    }

    public async getDFDisplayValues(
        fieldValue: DynamicFieldValue, short: boolean = false
    ): Promise<[string[], string, string[]]> {
        if (fieldValue) {
            const dynamicField = await KIXObjectService.loadDynamicField(fieldValue.Name ? fieldValue.Name : null);

            if (dynamicField && this.isLabelProviderForDFType(dynamicField.FieldType)) {
                const separator = dynamicField.Config && dynamicField.Config.ItemSeparator ?
                    dynamicField.Config.ItemSeparator : ', ';
                let values = fieldValue.PreparedValue;
                if (fieldValue.Value) {
                    const objects = await this.getObjects(fieldValue.Value);

                    if (objects) {
                        values = await this.getObjectTexts(short, objects);
                    }
                }
                return [values, values.join(separator), fieldValue.Value];
            }
        }

        return null;
    }

    private async getObjects(values: string[]): Promise<KIXObject[]> {
        let objectPromises = [];
        if (values) {
            if (!Array.isArray(values)) {
                values = [values];
            }

            // load objects separately, to prevent empty value if "no permission" error occurs
            objectPromises = values.map((v) => this.getObject(v));
        }

        const result = await Promise.allSettled(objectPromises);
        const objects = result.filter((r) => r.status === 'fulfilled').map((r) => r.value);
        return objects.filter((o) => o);
    }

    protected async getObject(value: any): Promise<KIXObject> {
        return null;
    }

    protected async getObjectTexts(short: boolean, objects: KIXObject[]): Promise<string[]> {
        const valuePromises = [];
        objects.forEach((object) =>
            valuePromises.push(
                LabelService.getInstance().getObjectText(object, true, true).catch(() => null)
            )
        );

        const values = [];
        await Promise.allSettled(valuePromises).then((results) =>
            results.forEach((r) => {
                if (r.status === 'fulfilled' && r.value) {
                    values.push(r.value);
                }
            })
        );

        return values;
    }

    public async createLabelsFromDFValue(dfValue: DynamicFieldValue): Promise<Label[]> {
        const dynamicField = dfValue && dfValue.ID ? await KIXObjectService.loadDynamicField(
            dfValue.Name ? dfValue.Name : null,
            dfValue.ID ? Number(dfValue.ID) : null
        ) : null;

        if (dynamicField && this.isLabelProviderForDFType(dynamicField.FieldType)) {
            if (dfValue.Value) {
                const objects = await this.getObjects(dfValue.Value);
                const labelPromises = objects.map((o) => this.getLabel(o).catch(() => null));
                const result = await Promise.allSettled(labelPromises);
                const labels = result.filter((r) => r.status === 'fulfilled').map((r) => r.value);
                return labels;
            }
        }
        return null;
    }

    protected async getLabel(object: KIXObject): Promise<Label> {
        return;
    }
}
