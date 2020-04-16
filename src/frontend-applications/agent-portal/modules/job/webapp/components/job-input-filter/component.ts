/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../../modules/base-components/webapp/core/FormInputComponent';
import { FormService } from '../../../../../modules/base-components/webapp/core/FormService';
import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { JobProperty } from '../../../model/JobProperty';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ContextType } from '../../../../../model/ContextType';
import { JobService, JobFormService } from '../../core';
import { ArticleProperty } from '../../../../ticket/model/ArticleProperty';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../../modules/base-components/webapp/core/InputFieldTypes';
import { JobType } from '../../../model/JobType';
import { JobTypes } from '../../../model/JobTypes';

class Component extends FormInputComponent<{}, ComponentState> {

    private listenerId: string;
    private formTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.listenerId = 'job-input-filter-manager-listener';
        await super.onMount();

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        await this.setManager();
        await this.setCurrentNode();


        formInstance.registerListener({
            formListenerId: 'job-input-filter',
            updateForm: () => { return; },
            formValueChanged: async (formField: FormFieldConfiguration, value: FormFieldValue<any>) => {
                if (formField.property === JobProperty.TYPE) {
                    this.setManager();
                    await this.setCurrentNode();
                } else if (formField.property === JobProperty.EXEC_PLAN_EVENTS) {
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                        const selectedEvents = context.getAdditionalInformation(JobProperty.EXEC_PLAN_EVENTS);
                        const hasArticleEvent = selectedEvents
                            ? await JobService.getInstance().hasArticleEvent(selectedEvents)
                            : false;

                        if (hasArticleEvent) {
                            // await this.addRequiredArticleProperties();
                        } else {
                            await this.removeArticleProperties();
                        }

                        const dynamicFormComponent = (this as any).getComponent('job-filter-dynamic-form');
                        if (dynamicFormComponent) {
                            dynamicFormComponent.updateValues();
                        }

                    }
                }
            }
        });

        this.state.prepared = true;
    }

    private async setManager(): Promise<void> {
        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        const typeValue = await formInstance.getFormFieldValueByProperty<string>(JobProperty.TYPE);
        const type = typeValue && typeValue.value ? typeValue.value : null;

        const jobFormManager = JobFormService.getInstance().getJobFormManager(type);

        this.state.manager = jobFormManager ? jobFormManager.filterManager : null;
        if (this.state.manager) {
            this.state.manager.init();

            this.state.manager.registerListener(this.listenerId, () => {
                if (this.formTimeout) {
                    clearTimeout(this.formTimeout);
                }
                this.formTimeout = setTimeout(async () => {
                    const filterValues = {};
                    if (this.state.manager.hasDefinedValues()) {
                        const values = this.state.manager.getEditableValues();
                        values.forEach((v) => {
                            if (v.value !== null) {
                                filterValues[v.property] = v.value;
                            }
                        });
                    }
                    super.provideValue(filterValues, true);
                }, 200);
            });
        }
    }

    private async addRequiredArticleProperties(): Promise<void> {
        const values = this.state.manager.getValues();

        const channelValue = values.find((v) => v.property === ArticleProperty.CHANNEL_ID);
        if (channelValue) {
            channelValue.required = true;
        } else {
            this.state.manager.setValue(
                new ObjectPropertyValue(ArticleProperty.CHANNEL_ID, null, null, true, true, KIXObjectType.ARTICLE)
            );
        }

        const senderTypeValue = values.find((v) => v.property === ArticleProperty.SENDER_TYPE_ID);
        if (senderTypeValue) {
            senderTypeValue.required = true;
        } else {
            this.state.manager.setValue(
                new ObjectPropertyValue(ArticleProperty.SENDER_TYPE_ID, null, null, true, true, KIXObjectType.ARTICLE)
            );
        }
    }

    private async removeArticleProperties(): Promise<void> {
        const values = this.state.manager.getValues();
        if (values) {
            const articleValues = values.filter((v) => {
                return v.property === ArticleProperty.SENDER_TYPE_ID
                    || v.property === ArticleProperty.CHANNEL_ID
                    || v.property === ArticleProperty.TO
                    || v.property === ArticleProperty.CC
                    || v.property === ArticleProperty.FROM
                    || v.property === ArticleProperty.SUBJECT
                    || v.property === ArticleProperty.BODY;
            });
            for (const av of articleValues) {
                await this.state.manager.removeValue(av);
            }
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.manager) {
            this.state.manager.unregisterListener(this.listenerId);
        }

        const form = await FormService.getInstance().getFormInstance(this.state.formId);
        if (form) {
            form.removeListener('job-input-filter');
        }
    }

    public async setCurrentNode(): Promise<void> {
        if (
            this.state.defaultValue && this.state.defaultValue.value
            && typeof this.state.defaultValue.value === 'object'
            && this.state.manager
        ) {
            for (const property in this.state.defaultValue.value) {
                if (property) {
                    let newProperty = property.replace('Ticket::', '');
                    newProperty = newProperty.replace('Article::', '');

                    let objectType;
                    const inputType = await this.state.manager.getInputType(newProperty);
                    if (inputType) {
                        if (inputType === InputFieldTypes.OBJECT_REFERENCE) {
                            objectType = await this.state.manager.getObjectReferenceObjectType(newProperty);
                        }
                        if ((inputType === InputFieldTypes.TEXT || inputType === InputFieldTypes.TEXT_AREA)
                            && Array.isArray(this.state.defaultValue.value[newProperty])
                        ) {
                            this.state.defaultValue.value[newProperty]
                                = this.state.defaultValue.value[newProperty][0];
                        }
                    }

                    const isRequired = this.isRequiredProperty(newProperty);
                    objectType = isRequired ? KIXObjectType.ARTICLE : objectType;
                    this.state.manager.setValue(
                        new ObjectPropertyValue(
                            newProperty, null, this.state.defaultValue.value[newProperty],
                            isRequired, true, objectType, null, null, newProperty
                        )
                    );
                }
            }
            super.provideValue(this.state.defaultValue.value, true);
        }
    }

    private isRequiredProperty(property: string): boolean {
        return false;
        // return property === ArticleProperty.CHANNEL_ID || property === ArticleProperty.SENDER_TYPE_ID;
    }

}

module.exports = Component;
