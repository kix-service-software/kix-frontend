/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { DynamicFieldValue } from '../../../dynamic-fields/model/DynamicFieldValue';
import { ObjectFormValue } from '../../model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';
import { ObjectCommitHandlerExtension } from './ObjectCommitHandlerExtension';
import { ObjectCommitSocketClient } from './ObjectCommitSocketClient';
import { ObjectFormRegistry } from './ObjectFormRegistry';

export class ObjectCommitHandler<T extends KIXObject = KIXObject> {

    public extensions: ObjectCommitHandlerExtension[] = [];
    protected kixObjectType: KIXObjectType | string = null;

    public constructor(protected objectValueMapper: ObjectFormValueMapper) {
        const extensions = ObjectFormRegistry.getInstance().getObjectCommitHandlerExtensions(this.kixObjectType);

        for (const mapperExtension of extensions) {
            this.extensions.push(new mapperExtension(objectValueMapper));
        }
    }

    public destroy(): void {
        for (const handlerExtension of this.extensions) {
            handlerExtension.destroy();
        }
    }

    public async commitObject(): Promise<number | string> {
        const newObject = await this.prepareObject(this.objectValueMapper.object as any);
        const id = await ObjectCommitSocketClient.getInstance().commitObject(newObject);
        return id;
    }

    public registerObjectCommitHandlerExtension(
        extension: ObjectCommitHandlerExtension
    ): void {
        this.extensions.push(extension);
    }

    public async prepareObject(object: T, forCommit: boolean = true): Promise<T> {
        const newObject = this.cloneObject(object);

        this.deleteCommonProperties(newObject, forCommit);
        this.prepareDynamicFields(newObject, forCommit);
        if (forCommit) {
            this.removeDisabledProperties(newObject);
        }

        if (this.extensions.length) {
            this.extensions.forEach((e) => {
                e.prepareObject(newObject);
            });
        }

        return newObject;
    }

    protected cloneObject(object: T, level: number = 0): T {
        level++;

        if (level === 3 || object === null || typeof object === 'undefined') {
            return object;
        }

        // create new object (do not change original)
        const newObject: T = {} as T;
        for (const key of Object.getOwnPropertyNames(object)) {
            const objectValue = object[key];

            if (typeof objectValue !== 'undefined') {
                if (Array.isArray(objectValue)) {
                    const newArray = [];
                    for (const arrVal of objectValue) {
                        let newVal = arrVal;
                        if (typeof arrVal === 'object') {
                            newVal = this.cloneObject(arrVal, level);
                        }
                        newArray.push(newVal);
                    }
                    newObject[key] = newArray;
                } else if (typeof objectValue === 'object') {
                    newObject[key] = this.cloneObject(objectValue, level);
                } else {
                    newObject[key] = objectValue;
                }
            }
        }

        return newObject;
    }

    protected deleteCommonProperties(object: KIXObject, forCommit: boolean): void {
        delete object['propertyBindings'];
        delete object['displayValues'];
        delete object['displayIcons'];
        delete object['ConfiguredPermissions'];
        delete object.ChangeBy;
        delete object.ChangeTime;
        delete object.CreateBy;
        delete object.CreateTime;
        delete object.LinkTypeName;
        delete object.Links;
        delete object.ObjectId;

        if (forCommit) {
            delete object['temp'];
        }
    }

    protected prepareDynamicFields(object: KIXObject, forCommit: boolean): void {
        const dfValues: DynamicFieldValue[] = [];
        if (Array.isArray(object.DynamicFields)) {
            const isNewContext = this.objectValueMapper?.formContext === FormContext.NEW;

            for (const dfv of object.DynamicFields) {
                const formValue = this.objectValueMapper?.findFormValue(`DynamicFields.${dfv.Name}`);

                if (!forCommit || formValue?.enabled) {
                    const dfValue = new DynamicFieldValue(dfv);
                    delete dfValue['propertyBindings'];
                    delete dfValue['displayValues'];

                    this.setDynamicFieldValue(dfValue, isNewContext);

                    if (dfValue.Value) {
                        dfValues.push(dfValue);
                    }
                }
            }

            object.DynamicFields = dfValues;
        }

        if (!Array.isArray(object.DynamicFields) || !object.DynamicFields.length) {
            delete object.DynamicFields;
        }
    }

    protected setDynamicFieldValue(dfv: DynamicFieldValue, isNewContext: boolean): void {
        if (typeof dfv.Value !== 'undefined' && dfv.Value !== null) {
            if (!Array.isArray(dfv.Value)) {
                dfv.Value = [dfv.Value];
            }
        } else if (!Array.isArray(dfv.Value) && dfv.Value) {
            dfv.Value = [dfv.Value];
        }

        if (Array.isArray(dfv.Value)) {
            dfv.Value = dfv.Value.filter((v) => typeof v !== 'undefined' && v !== null);
        }

        if (!dfv.Value && !isNewContext) {
            dfv.Value = [];
        }
    }

    protected removeDisabledProperties(
        newObject: KIXObject, formValues: ObjectFormValue[] = this.objectValueMapper?.getFormValues()
    ): void {
        if (Array.isArray(formValues)) {
            for (const fv of formValues) {
                if (!fv.enabled && fv.property !== KIXObjectProperty.DYNAMIC_FIELDS) {
                    fv.deleteObjectValue(newObject);
                }
            }
        }
    }

}