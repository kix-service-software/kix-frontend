/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { DynamicField } from '../model/DynamicField';
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FormContext } from '../../../model/configuration/FormContext';
import { FormPageConfiguration } from '../../../model/configuration/FormPageConfiguration';
import { FormGroupConfiguration } from '../../../model/configuration/FormGroupConfiguration';
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../base-components/webapp/core/ObjectReferenceOptions';
import { DynamicFormFieldOption } from '../webapp/core/DynamicFormFieldOption';
import { DynamicFieldFormUtil } from '../../base-components/webapp/core/DynamicFieldFormUtil';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldTypes } from '../model/DynamicFieldTypes';
import { DateTimeUtil } from '../../base-components/webapp/core/DateTimeUtil';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('DynamicFieldFormUtil', () => {

    describe('Add only valid dynamic fields to form', () => {
        let form: FormConfiguration;
        const dfConfig = {
            CountMin: 0,
            CountMax: 5,
            CountDefault: 1,
            RegExList: []
        };

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                df = new DynamicField();
                df.FieldType = 'Text';
                df.Name = 'Text';
                df.Config = dfConfig;
                df.ValidID = name === 'valid' ? 1 : 0;
                df.ObjectType = KIXObjectType.TICKET;
                return df;
            };

            const fields = [];
            for (let i = 0; i < 20; i++) {
                fields.push(
                    new FormFieldConfiguration(
                        'test-field-' + i, 'Testfield', KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
                        [
                            new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, i < 10 ? 'invalid' : 'valid')
                        ]
                    )
                );
            }
            form = createForm(fields);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('should contain only form fields based on valid dynamic fields', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(10);
        });
    });

    describe('Add dynamic field of type Text to form', () => {

        let form: FormConfiguration;
        const dfConfig = {
            CountMin: 0,
            CountMax: 5,
            CountDefault: 1,
            RegExList: []
        };
        const field = new FormFieldConfiguration(
            'test-field', 'Testfield', KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
            [
                new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'Text')
            ]
        );

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                if (name === 'Text') {
                    df = new DynamicField();
                    df.FieldType = 'Text';
                    df.Name = 'Text';
                    df.Config = dfConfig;
                    df.ValidID = 1;
                    df.ObjectType = KIXObjectType.TICKET;
                }
                return df;
            };

            form = createForm([field]);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('the form should contain the field', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(1);
            expect(form.pages[0].groups[0].formFields[0].id).equals('test-field');
        });

        it('the input component should be null', () => {
            expect(form.pages[0].groups[0].formFields[0].inputComponent).null;
        });

        it('the CountMin should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMin).equals(dfConfig.CountMin);
        });

        it('the CountMax should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMax).equals(dfConfig.CountMax);
        });

        it('the CountDefault should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countDefault).equals(dfConfig.CountDefault);
        });

        it('the field label should be the configured form field label', () => {
            expect(form.pages[0].groups[0].formFields[0].label).equals(field.label);
        });

    });

    describe('Add dynamic field of type TextArea to form', () => {

        let form: FormConfiguration;
        const dfConfig = {
            CountMin: 0,
            CountMax: 5,
            CountDefault: 1,
            RegExList: []
        };
        const field = new FormFieldConfiguration(
            'test-field', null, KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
            [
                new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'TextArea')
            ]
        );

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                if (name === 'TextArea') {
                    df = new DynamicField();
                    df.FieldType = 'TextArea';
                    df.Name = 'TextArea';
                    df.Label = 'TextArea';
                    df.Config = dfConfig;
                    df.ValidID = 1;
                    df.ObjectType = KIXObjectType.TICKET;
                }
                return df;
            };

            form = createForm([field]);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('the form should contain the field', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(1);
            expect(form.pages[0].groups[0].formFields[0].id).equals('test-field');
        });

        it('the input component should be text-area-input', () => {
            expect(form.pages[0].groups[0].formFields[0].inputComponent).equals('text-area-input');
        });

        it('the CountMin should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMin).equals(dfConfig.CountMin);
        });

        it('the CountMax should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMax).equals(dfConfig.CountMax);
        });

        it('the CountDefault should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countDefault).equals(dfConfig.CountDefault);
        });

        it('the field label should be the configured dynamic field label', () => {
            expect(form.pages[0].groups[0].formFields[0].label).equals('TextArea');
        });

    });

    describe('Add dynamic field of type Date to form', () => {

        let form: FormConfiguration;
        const dfConfig = {
            CountMin: 0,
            CountMax: 5,
            CountDefault: 1,
            DefaultValue: 5
        };
        const field = new FormFieldConfiguration(
            'test-field', null, KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
            [
                new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'Date')
            ]
        );

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                if (name === 'Date') {
                    df = new DynamicField();
                    df.FieldType = DynamicFieldTypes.DATE;
                    df.Name = 'Date';
                    df.Label = 'Date';
                    df.Config = dfConfig;
                    df.ValidID = 1;
                    df.ObjectType = KIXObjectType.TICKET;
                }
                return df;
            };

            form = createForm([field]);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('the form should contain the field', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(1);
            expect(form.pages[0].groups[0].formFields[0].id).equals('test-field');
        });

        it('the input component should be date-time-input', () => {
            expect(form.pages[0].groups[0].formFields[0].inputComponent).equals('date-time-input');
        });

        it('the CountMin should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMin).equals(dfConfig.CountMin);
        });

        it('the CountMax should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMax).equals(dfConfig.CountMax);
        });

        it('the CountDefault should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countDefault).equals(dfConfig.CountDefault);
        });

        it('the field label should be the configured dynamic field label', () => {
            expect(form.pages[0].groups[0].formFields[0].label).equals('Date');
        });

        it('the field default value should be set', () => {
            expect(form.pages[0].groups[0].formFields[0].defaultValue).exist;
            expect(form.pages[0].groups[0].formFields[0].defaultValue.value).exist;
            expect(form.pages[0].groups[0].formFields[0].defaultValue.value).instanceOf(Date);
        });

        it('the field default value should be a date with time 00:00:00', () => {
            const formField = form.pages[0].groups[0].formFields[0];
            expect(formField.defaultValue).exist;
            expect(formField.defaultValue.value).exist;
            expect(formField.defaultValue.value).instanceOf(Date);
            const time = DateTimeUtil.getKIXTimeString(formField.defaultValue.value, false);
            expect(time).equals('00:00:00');
        });

        it('the field default value should have an offset based on the default value of the df config', () => {
            const formField = form.pages[0].groups[0].formFields[0];
            expect(formField.defaultValue).exist;
            expect(formField.defaultValue.value).exist;
            expect(formField.defaultValue.value).instanceOf(Date);

            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + dfConfig.DefaultValue);
            currentDate.setHours(0, 0, 0, 0);

            expect(currentDate.getTime()).equals(formField.defaultValue.value.getTime());
        });

    });

    describe('Add dynamic field of type DateTime to form', () => {

        let form: FormConfiguration;
        const dfConfig = {
            CountMin: 0,
            CountMax: 5,
            CountDefault: 1,
            DefaultValue: 5
        };
        const field = new FormFieldConfiguration(
            'test-field', null, KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
            [
                new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'DateTime')
            ]
        );

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                if (name === 'DateTime') {
                    df = new DynamicField();
                    df.FieldType = DynamicFieldTypes.DATE_TIME;
                    df.Name = 'DateTime';
                    df.Label = 'DateTime';
                    df.Config = dfConfig;
                    df.ValidID = 1;
                    df.ObjectType = KIXObjectType.TICKET;
                }
                return df;
            };

            form = createForm([field]);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('the form should contain the field', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(1);
            expect(form.pages[0].groups[0].formFields[0].id).equals('test-field');
        });

        it('the input component should be date-time-input', () => {
            expect(form.pages[0].groups[0].formFields[0].inputComponent).equals('date-time-input');
        });

        it('the CountMin should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMin).equals(dfConfig.CountMin);
        });

        it('the CountMax should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMax).equals(dfConfig.CountMax);
        });

        it('the CountDefault should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countDefault).equals(dfConfig.CountDefault);
        });

        it('the field label should be the configured dynamic field label', () => {
            expect(form.pages[0].groups[0].formFields[0].label).equals('DateTime');
        });

        it('the field default value should be set', () => {
            expect(form.pages[0].groups[0].formFields[0].defaultValue).exist;
            expect(form.pages[0].groups[0].formFields[0].defaultValue.value).exist;
            expect(form.pages[0].groups[0].formFields[0].defaultValue.value).instanceOf(Date);
        });

    });

    describe('Add dynamic field of type Multiselect to form', () => {

        let form: FormConfiguration;
        const dfConfig = {
            CountMin: 2,
            CountMax: 5,
            CountDefault: 0,
            DefaultValue: 5,
            PossibleValues: {
                "0": "first possible value",
                "1": "second possible value",
                "2": "third possible value",
                "3": "fourd possible value",
                "4": "fifth possible value",
                "5": "sixth possible value",
                "6": "seventh possible value",
                "7": "eighth possible value",
                "8": "ninth possible value",
                "9": "tenth possible value"
            }
        };
        const field = new FormFieldConfiguration(
            'test-field', null, KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
            [
                new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'Multiselect')
            ]
        );

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                if (name === 'Multiselect') {
                    df = new DynamicField();
                    df.FieldType = 'Multiselect';
                    df.Name = 'Multiselect';
                    df.Label = 'Multiselect';
                    df.Config = dfConfig;
                    df.ValidID = 1;
                    df.ObjectType = KIXObjectType.TICKET;
                }
                return df;
            };

            form = createForm([field]);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('the form should contain the field', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(1);
            expect(form.pages[0].groups[0].formFields[0].id).equals('test-field');
        });

        it('the input component should be object-reference-input', () => {
            expect(form.pages[0].groups[0].formFields[0].inputComponent).equals('object-reference-input');
        });

        it('the CountMin should have the value 1', () => {
            expect(form.pages[0].groups[0].formFields[0].countMin).equals(1);
        });

        it('the CountMax should have the value 1', () => {
            expect(form.pages[0].groups[0].formFields[0].countMax).equals(1);
        });

        it('the CountDefault should have the value 1', () => {
            expect(form.pages[0].groups[0].formFields[0].countDefault).equals(1);
        });

        it('the field label should be the configured dynamic field label', () => {
            expect(form.pages[0].groups[0].formFields[0].label).equals('Multiselect');
        });

        it('the form field should have COUNT_MIN = 2 as option', () => {
            const option = form.pages[0].groups[0].formFields[0].options.find((o) => o.option === ObjectReferenceOptions.COUNT_MIN);
            expect(option).exist;
            expect(option.value).equals(2);
        });

        it('the form field should have COUNT_MAX = 5 as option', () => {
            const option = form.pages[0].groups[0].formFields[0].options.find((o) => o.option === ObjectReferenceOptions.COUNT_MAX);
            expect(option).exist;
            expect(option.value).equals(5);
        });

        it('the field has to be required', () => {
            expect(form.pages[0].groups[0].formFields[0].required).true;
        });

        it('the field should have additional nodes options based on dynamic field config PossibleValues', () => {
            const option = form.pages[0].groups[0].formFields[0].options.find((o) => o.option === ObjectReferenceOptions.ADDITIONAL_NODES);
            expect(option).exist;
            expect(option.value).an('array');
            expect(option.value.length).equals(10);
        });

        it('the field should have the MULTISELECT option set based on CountMin and CountMax', () => {
            const option = form.pages[0].groups[0].formFields[0].options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
            expect(option).exist;
            expect(option.value).true;
        });

    });

    describe('Add dynamic field of type Checklist to form', () => {

        let form: FormConfiguration;
        const dfConfig = {};
        const field = new FormFieldConfiguration(
            'test-field', null, KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
            [
                new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'CheckList')
            ]
        );

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                if (name === 'CheckList') {
                    df = new DynamicField();
                    df.FieldType = 'CheckList';
                    df.Name = 'CheckList';
                    df.Label = 'CheckList';
                    df.Config = dfConfig;
                    df.ValidID = 1;
                    df.ObjectType = KIXObjectType.TICKET;
                }
                return df;
            };

            form = createForm([field]);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('the form should contain the field', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(1);
            expect(form.pages[0].groups[0].formFields[0].id).equals('test-field');
        });

        it('the input component should be dynamic-field-checklist-input', () => {
            expect(form.pages[0].groups[0].formFields[0].inputComponent).equals('dynamic-field-checklist-input');
        });

    });

    describe('Add dynamic field of type Table to form', () => {

        let form: FormConfiguration;
        const dfConfig = {};
        const field = new FormFieldConfiguration(
            'test-field', null, KIXObjectProperty.DYNAMIC_FIELDS, null, true, null,
            [
                new FormFieldOption(DynamicFormFieldOption.FIELD_NAME, 'Table')
            ]
        );

        before(async () => {
            KIXObjectService.loadDynamicField = async (name: string): Promise<DynamicField> => {
                let df: DynamicField;
                if (name === 'Table') {
                    df = new DynamicField();
                    df.FieldType = 'Table';
                    df.Name = 'Table';
                    df.Label = 'Table';
                    df.Config = dfConfig;
                    df.ValidID = 1;
                    df.ObjectType = KIXObjectType.TICKET;
                }
                return df;
            };

            form = createForm([field]);
            await DynamicFieldFormUtil.getInstance().configureDynamicFields(form);
        });

        it('the form should contain the field', () => {
            expect(form.pages[0].groups[0].formFields).exist;
            expect(form.pages[0].groups[0].formFields.length).equals(1);
            expect(form.pages[0].groups[0].formFields[0].id).equals('test-field');
        });

        it('the CountMin should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMin).equals(1);
        });

        it('the CountMax should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countMax).equals(1);
        });

        it('the CountDefault should have the value of the dynamic field config', () => {
            expect(form.pages[0].groups[0].formFields[0].countDefault).equals(1);
        });

        it('the field has to be required', () => {
            expect(form.pages[0].groups[0].formFields[0].required).true;
        });
    });

});

function createForm(fields: FormFieldConfiguration[]): FormConfiguration {
    const form = new FormConfiguration(
        'test-form', 'test-form', null, KIXObjectType.TICKET, true, FormContext.NEW, null,
        [
            new FormPageConfiguration(
                'test-page', 'test-page', [], true, true,
                [
                    new FormGroupConfiguration(
                        'test-group', 'test-group', [], ';', fields
                    )
                ]
            )
        ]
    );
    return form;
}