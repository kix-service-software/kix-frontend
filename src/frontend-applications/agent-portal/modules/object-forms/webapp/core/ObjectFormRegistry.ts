/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AbstractAction } from '../../../base-components/webapp/core/AbstractAction';
import { FormValueAction } from '../../model/FormValues/FormValueAction';
import { ObjectFormValue } from '../../model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';
import { ObjectFormValueMapperExtension } from '../../model/ObjectFormValueMapperExtension';
import { ObjectCommitHandler } from './ObjectCommitHandler';
import { ObjectCommitHandlerExtension } from './ObjectCommitHandlerExtension';
import { ObjectFormHandler } from './ObjectFormHandler';
import { ObjectFormValueValidator } from './validation/ObjectFormValueValidator';

export class ObjectFormRegistry {

    private static INSTANCE: ObjectFormRegistry;

    public static getInstance(): ObjectFormRegistry {
        if (!ObjectFormRegistry.INSTANCE) {
            ObjectFormRegistry.INSTANCE = new ObjectFormRegistry();
        }
        return ObjectFormRegistry.INSTANCE;
    }

    private constructor() { }

    // eslint-disable-next-line max-len
    private objectFormValueMapper: Map<KIXObjectType | string, new (objectFormHandler: ObjectFormHandler) => ObjectFormValueMapper> = new Map();
    // eslint-disable-next-line max-len
    private objectCommitHandler: Map<KIXObjectType | string, new (objectValueMapper: ObjectFormValueMapper) => ObjectCommitHandler> = new Map();
    private objectFormValidators: Array<new () => ObjectFormValueValidator> = [];
    // eslint-disable-next-line max-len
    private objectFormValueMapperExtensions: Array<new (mapper: ObjectFormValueMapper) => ObjectFormValueMapperExtension> = [];
    // eslint-disable-next-line max-len
    private objectCommitHandlerExtensions: Map<KIXObjectType | string, Array<new (objectValueMapper: ObjectFormValueMapper) => ObjectCommitHandlerExtension>> = new Map();
    // eslint-disable-next-line max-len
    private formValueActions: Map<string, Array<new (formValue: ObjectFormValue, objectValueMapper: ObjectFormValueMapper) => FormValueAction>> = new Map();

    public registerObjectFormCreator(
        // eslint-disable-next-line max-len
        objectType: KIXObjectType | string, objectFormCreator: new (objectFormHandler: ObjectFormHandler) => ObjectFormValueMapper
    ): void {
        if (objectFormCreator) {
            this.objectFormValueMapper.set(objectType, objectFormCreator);
        }
    }

    public createObjectFormValueMapper(
        objectType: KIXObjectType | string, objectFormHandler: ObjectFormHandler
    ): ObjectFormValueMapper {
        let objectValueMapper: ObjectFormValueMapper;
        const mapperClass = this.objectFormValueMapper.get(objectType);
        if (mapperClass) {
            objectValueMapper = new mapperClass(objectFormHandler);
        }

        return objectValueMapper;
    }

    public registerObjectCommitHandler(
        objectType: KIXObjectType | string,
        commitHandler: new (objectValueMapper: ObjectFormValueMapper) => ObjectCommitHandler
    ): void {
        if (commitHandler) {
            this.objectCommitHandler.set(objectType, commitHandler);
        }
    }

    public createObjectCommitHandler<T extends KIXObject = KIXObject>(
        objectValueMapper: ObjectFormValueMapper
    ): ObjectCommitHandler<T> {
        let commitHandler: ObjectCommitHandler<T>;
        const commitClass = this.objectCommitHandler.get(objectValueMapper?.object?.KIXObjectType);
        if (commitClass) {
            commitHandler = new commitClass(objectValueMapper) as any;
        }

        return commitHandler;
    }

    public registerObjectFormValueValidator(validator: new () => ObjectFormValueValidator): void {
        this.objectFormValidators.push(validator);
    }

    public createValidators(): ObjectFormValueValidator[] {
        const validators = this.objectFormValidators.map((v) => new v());
        return validators;
    }

    public registerObjectValueMapperExtension(
        extension: new (mapper: ObjectFormValueMapper) => ObjectFormValueMapperExtension
    ): void {
        this.objectFormValueMapperExtensions.push(extension);
    }

    public getObjectFormValueMapperExtensions()
        : Array<new (mapper: ObjectFormValueMapper) => ObjectFormValueMapperExtension> {
        return this.objectFormValueMapperExtensions || [];
    }

    public registerObjectCommitHandlerExtension(
        objectType: KIXObjectType | string,
        extension: new (objectValueMapper: ObjectFormValueMapper) => ObjectCommitHandlerExtension
    ): void {
        if (!this.objectCommitHandlerExtensions.has(objectType)) {
            this.objectCommitHandlerExtensions.set(objectType, []);
        }
        const list = this.objectCommitHandlerExtensions.get(objectType);
        list.push(extension);
    }

    public getObjectCommitHandlerExtensions(objectType: KIXObjectType | string)
        : Array<new (objectValueMapper: ObjectFormValueMapper) => ObjectCommitHandlerExtension> {
        if (objectType && this.objectCommitHandlerExtensions.has(objectType)) {
            return this.objectCommitHandlerExtensions.get(objectType);
        }
        return [];
    }

    public registerFormValueAction(
        property: string,
        action: new (formValue: ObjectFormValue, objectValueMapper: ObjectFormValueMapper) => FormValueAction
    ): void {
        if (!this.formValueActions.has(property)) {
            this.formValueActions.set(property, []);
        }

        this.formValueActions.get(property).push(action);
    }

    public async getActions(
        formValue: ObjectFormValue, objectValueMapper: ObjectFormValueMapper
    ): Promise<FormValueAction[]> {
        const actions: FormValueAction[] = [];
        if (this.formValueActions.has(formValue?.property)) {
            const actionClasses = this.formValueActions.get(formValue?.property);
            for (const ac of actionClasses) {
                const action = new ac(formValue, objectValueMapper);
                await action.initAction();
                actions.push(action);
            }
        }

        return actions;
    }

}