/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import {
    FormInputComponent, InputFieldTypes, FormFieldValue, FormField, NotificationProperty,
    ContextType, ArticleProperty, KIXObjectType
} from '../../../../../../core/model';
import { ObjectPropertyValue, FormService, ContextService } from '../../../../../../core/browser';
import { NotificationService } from '../../../../../../core/browser/notification';

class Component extends FormInputComponent<Array<[string, string[] | number[]]>, ComponentState> {

    private listenerId: string;
    private formTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        this.listenerId = 'notification-input-filter-manager-listener';
        await super.onMount();
        this.state.manager.init();
        await this.setCurrentNode();

        const form = await FormService.getInstance().getFormInstance(this.state.formId);
        form.registerListener({
            formListenerId: 'notification-input-filter',
            updateForm: () => { return; },
            formValueChanged: async (formField: FormField, value: FormFieldValue<any>) => {
                if (formField.property === NotificationProperty.DATA_EVENTS) {
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                        const selectedEvents = context.getAdditionalInformation(NotificationProperty.DATA_EVENTS);
                        const hasArticleEvent = selectedEvents
                            ? await NotificationService.getInstance().hasArticleEvent(selectedEvents)
                            : false;

                        if (hasArticleEvent) {
                            await this.addRequiredArticleProperties();
                        } else {
                            await this.removeArticleProperties();
                        }
                    }

                    const dynamicFormComponent = (this as any).getComponent('notification-dynamic-form');
                    if (dynamicFormComponent) {
                        dynamicFormComponent.updateValues();
                    }
                }
            }
        });

        this.state.manager.registerListener(this.listenerId, () => {
            if (this.formTimeout) {
                clearTimeout(this.formTimeout);
            }
            this.formTimeout = setTimeout(async () => {
                const filterValues: Array<[string, string[] | number[]]> = [];
                if (this.state.manager.hasDefinedValues()) {
                    const values = this.state.manager.getEditableValues();
                    values.forEach((v) => {
                        if (v.value !== null) {
                            filterValues.push([v.property, v.value]);
                        }
                    });

                    const dynamicFormComponent = (this as any).getComponent('notification-dynamic-form');
                    if (dynamicFormComponent) {
                        dynamicFormComponent.updateValues();
                    }
                }
                super.provideValue(filterValues);
            }, 200);
        });
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
            form.removeListener('notification-input-filter');
        }
    }

    public async setCurrentNode(): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value) {
            for (const value of this.state.defaultValue.value) {
                let objectType;
                const inputType = await this.state.manager.getInputType(value[0]);
                if (inputType && inputType === InputFieldTypes.OBJECT_REFERENCE) {
                    objectType = await this.state.manager.getObjectReferenceObjectType(value[0]);
                }

                objectType = this.isRequiredProperty ? KIXObjectType.ARTICLE : objectType;
                const isRequired = this.isRequiredProperty(value[0]);
                this.state.manager.setValue(
                    new ObjectPropertyValue(
                        value[0], null, value[1], isRequired, true, objectType, null, null, value[0]
                    )
                );
            }
            super.provideValue(this.state.defaultValue.value);
        }
    }

    private isRequiredProperty(property: string): boolean {
        return property === ArticleProperty.CHANNEL_ID || property === ArticleProperty.SENDER_TYPE_ID;
    }

}

module.exports = Component;
