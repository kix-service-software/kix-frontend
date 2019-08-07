/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent, InputFieldTypes } from '../../../../../../core/model';
import { ObjectPropertyValue } from '../../../../../../core/browser';

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
                }
                super.provideValue(filterValues);
            }, 200);
        });
    }

    public async onDestroy(): Promise<void> {
        if (this.state.manager) {
            this.state.manager.unregisterListener(this.listenerId);
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
                this.state.manager.setValue(
                    new ObjectPropertyValue(value[0], null, value[1], objectType, null, null, value[0])
                );
            }
            super.provideValue(this.state.defaultValue.value);
        }
    }

}

module.exports = Component;
