/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { FormFieldOptions } from '../../../model/configuration/FormFieldOptions';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FormInstance } from '../../base-components/webapp/core/FormInstance';
import { InputFieldTypes } from '../../base-components/webapp/core/InputFieldTypes';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../base-components/webapp/core/ObjectReferenceOptions';
import { ReportDefinitionProperty } from '../model/ReportDefinitionProperty';
import { CreateReportActionJobFormManager } from '../webapp/core/form/CreateReportActionJobFormManager';

chai.use(chaiAsPromised);
const expect = chai.expect;

const optionsMock = {
    DefinitionID: {
        "Description": "The ID of the report definition.",
        "Label": "Report Definition",
        "Name": "DefinitionID",
        "Order": 1,
        "Required": 1,
        "PossibleValues": null,
        "DefaultValue": null
    },
    OutputFormat: {
        "Description": "The requested output format.",
        "Label": "Output Format",
        "Name": "OutputFormats",
        "Order": 3,
        "Required": 1,
        "PossibleValues": null,
        "DefaultValue": null
    },
    Parameters: {
        "Description": "The parameters of the report. This is a JSON string.",
        "Label": "Parameters",
        "Name": "Parameters",
        "Order": 2,
        "Required": 1,
        "PossibleValues": null,
        "DefaultValue": null
    }
};

const actionMock = {
    "ID": 4,
    "MacroID": 10,
    "Parameters": {
        "DefinitionID": 2,
        "OutputFormats": ["CSV"],
        "Parameters": {
            "EndDate": "2021-04-16",
            "OrganisationIDList": [
                1
            ],
            "StartDate": "2021-04-10"
        }
    },
    "ResultVariables": {},
    "Type": "CreateReport"
};

const csvOutputFormatMock = {
    "Description": "Converts the report data to CSV.",
    "DisplayName": "CSV",
    "Name": "CSV",
    "Options": {
        "Columns": {
            "Description": "A list (Array) of the columns to be contained in the order in which they should occur in the output result.",
            "Label": "Columns",
            "Name": "Columns",
            "Required": 1
        },
        "IncludeColumnHeader": {
            "Description": "Determine if a header containing the column names should be contained. Default: 0 (true).",
            "Label": "Include Column Headers",
            "Name": "IncludeColumnHeader",
            "Required": 0
        },
        "Quote": {
            "Description": "The quote character to be used. Default: \" (Double Quote).",
            "Label": "Quote",
            "Name": "Quote",
            "Required": 0
        },
        "Separator": {
            "Description": "The value separator to be used. Default: , (Comma).",
            "Label": "Separator",
            "Name": "Separator",
            "Required": 0
        },
        "Title": {
            "Description": "A simple title, contained in the first row/cell of the output result.",
            "Label": "Title",
            "Name": "Title",
            "Required": 0
        }
    }
};

const reportDefinitionsMock = {
    "ChangeBy": 1,
    "ChangeTime": "2021-04-07 08:30:48",
    "Comment": "Lists tickets closed in a specific date range. Organization may be selected before report creation.",
    "Config": {
        "DataSource": {
            "OutputHandler": [
                {
                    "Columns": [
                        "CloseCode"
                    ],
                    "FieldNames": [
                        "CloseCode"
                    ],
                    "Name": "ResolveDynamicFieldValue"
                },
                {
                    "Columns": [
                        "CloseCode",
                        "State",
                        "Type"
                    ],
                    "Name": "Translate"
                }
            ],
            "SQL": {
                "any": "base64(U0VMRUNUIHR0Lm5hbWUgQVMgIlR5cGUiLCAKICAgICAgIHQudG4gQVMgIlROUiIsIAogICAgICAgdC50aXRsZSBBUyAiVGl0bGUiLCAKICAgICAgIHRzLm5hbWUgQVMgIlN0YXRlIiwKICAgICAgIG8ubmFtZSBBUyAiT3JnYW5pc2F0aW9uIiwgCiAgICAgICBjLmVtYWlsIEFTICJDb250YWN0IiwgCiAgICAgICB0LmFjY291bnRlZF90aW1lIEFTICJBY2NvdW50ZWQgVGltZSIKJHtGdW5jdGlvbnMuaWZfcGx1Z2luX2F2YWlsYWJsZSgnS0lYUHJvJywnLAogICAgIGRmdi52YWx1ZV90ZXh0IEFTICJDbG9zZSBDb2RlIiwKICAgICBzbGFfcmVzcG9uc2UubmFtZSBBUyAiU0xBIFJlc3BvbnNlIE5hbWUiLAogICAgIHRzY19yZXNwb25zZS50YXJnZXRfdGltZSBBUyAiU0xBIFJlc3BvbnNlIFRhcmdldCBUaW1lIiwgCiAgICAgdHNjX3Jlc3BvbnNlLmZ1bGZpbGxtZW50X3RpbWUgQVMgIlNMQSBSZXNwb25zZSBGdWxmaWxsbWVudCBUaW1lIiwgCiAgICAgdHNjX3Jlc3BvbnNlLnRpbWVfZGV2aWF0aW9uX2J1c2luZXNzIEFTICJTTEEgUmVzcG9uc2UgQnVzaW5lc3MgVGltZSBEZXZpYXRpb24iLAogICAgIHNsYV9zb2x1dGlvbi5uYW1lIEFTICJTTEEgU29sdXRpb24gTmFtZSIsCiAgICAgdHNjX3NvbHV0aW9uLnRhcmdldF90aW1lIEFTICJTTEEgU29sdXRpb24gVGFyZ2V0IFRpbWUiICwgCiAgICAgdHNjX3NvbHV0aW9uLmZ1bGZpbGxtZW50X3RpbWUgQVMgIlNMQSBTb2x1dGlvbiBGdWxmaWxsbWVudCBUaW1lIiwgCiAgICAgdHNjX3NvbHV0aW9uLnRpbWVfZGV2aWF0aW9uX2J1c2luZXNzIEFTICJTTEEgU29sdXRpb24gQnVzaW5lc3MgVGltZSBEZXZpYXRpb24iCicpfQogIEZST00gb3JnYW5pc2F0aW9uIG8sIAogICAgICAgY29udGFjdCBjLCAKICAgICAgIHRpY2tldF90eXBlIHR0LAogICAgICAgdGlja2V0X3N0YXRlIHRzLAogICAgICAgdGlja2V0IHQKJHtGdW5jdGlvbnMuaWZfcGx1Z2luX2F2YWlsYWJsZSgnS0lYUHJvJywnCiAgTEVGVCBPVVRFUiBKT0lOIGR5bmFtaWNfZmllbGQgZGYgT04gKGRmLm5hbWUgPSAnQ2xvc2VDb2RlJykKICBMRUZUIE9VVEVSIEpPSU4gZHluYW1pY19maWVsZF92YWx1ZSBkZnYgT04gKGRmdi5vYmplY3RfaWQgPSB0LmlkIEFORCBkZnYuZmllbGRfaWQgPSBkZi5pZCkKICBMRUZUIE9VVEVSIEpPSU4gdGlja2V0X3NsYV9jcml0ZXJpb24gdHNjX3Jlc3BvbnNlIE9OICh0c2NfcmVzcG9uc2UudGlja2V0X2lkID0gdC5pZCBBTkQgdHNjX3Jlc3BvbnNlLm5hbWUgPSAnUmVzcG9uc2UnKQogIExFRlQgT1VURVIgSk9JTiBzbGEgQVMgc2xhX3Jlc3BvbnNlIE9OICh0c2NfcmVzcG9uc2Uuc2xhX2lkID0gc2xhX3Jlc3BvbnNlLmlkKQogIExFRlQgT1VURVIgSk9JTiB0aWNrZXRfc2xhX2NyaXRlcmlvbiB0c2Nfc29sdXRpb24gT04gKHRzY19zb2x1dGlvbi50aWNrZXRfaWQgPSB0LmlkIEFORCB0c2Nfc29sdXRpb24ubmFtZSA9ICdTb2x1dGlvbicpCiAgTEVGVCBPVVRFUiBKT0lOIHNsYSBBUyBzbGFfc29sdXRpb24gT04gKHRzY19zb2x1dGlvbi5zbGFfaWQgPSBzbGFfc29sdXRpb24uaWQpCicpfQogV0hFUkUgdC50eXBlX2lkID0gdHQuaWQKICAgQU5EIHQudGlja2V0X3N0YXRlX2lkID0gdHMuaWQKICAgQU5EIHQub3JnYW5pc2F0aW9uX2lkID0gby5pZAogICBBTkQgdC5jb250YWN0X2lkID0gYy5pZAogICBBTkQgby5pZCBJTiAoJHtQYXJhbWV0ZXJzLk9yZ2FuaXNhdGlvbklETGlzdH0pCiAgIEFORCBFWElTVFMgKAogICAgIFNFTEVDVCB0aC5pZCAKICAgICAgIEZST00gdGlja2V0X3N0YXRlIHRzLAogICAgICAgICAgICB0aWNrZXRfaGlzdG9yeSB0aCwKICAgICAgICAgICAgdGlja2V0X2hpc3RvcnlfdHlwZSB0aHQsCiAgICAgICAgICAgIHRpY2tldF9zdGF0ZV90eXBlIHRzdAogICAgICBXSEVSRSB0aC50aWNrZXRfaWQgPSB0LmlkCiAgICAgICAgQU5EIHRoLmhpc3RvcnlfdHlwZV9pZCA9IHRodC5pZAogICAgICAgIEFORCB0aHQubmFtZSA9ICdTdGF0ZVVwZGF0ZScKICAgICAgICBBTkQgdGguc3RhdGVfaWQgPSB0cy5pZAogICAgICAgIEFORCB0cy50eXBlX2lkID0gdHN0LmlkCiAgICAgICAgQU5EIHRzdC5uYW1lID0gJ2Nsb3NlZCcKICAgICAgICBBTkQgdGguY3JlYXRlX3RpbWUgQkVUV0VFTiAnJHtQYXJhbWV0ZXJzLlN0YXJ0RGF0ZX0gMDA6MDA6MDAnIEFORCAnJHtQYXJhbWV0ZXJzLkVuZERhdGV9IDIzOjU5OjU5JwogICApCiBPUkRFUiBCWSB0dC5uYW1lLCB0LnRu)"
            }
        },
        "Parameters": [
            {
                "DataType": "DATE",
                "Label": "Start",
                "Name": "StartDate",
                "Required": 1
            },
            {
                "DataType": "DATE",
                "Label": "End",
                "Name": "EndDate",
                "Required": 1
            },
            {
                "DataType": "NUMERIC",
                "Label": "Organisation",
                "Multiple": 1,
                "Name": "OrganisationIDList",
                "References": "Organisation.ID",
                "Required": 1
            }
        ]
    },
    "CreateBy": 1,
    "CreateTime": "2021-04-07 08:30:48",
    "DataSource": "GenericSQL",
    "ID": 2,
    "Name": "Tickets Closed In Date Range",
    "Reports": [],
    "ValidID": 1
};

describe('CreateReportActionJobFormManager', () => {

    describe('Create the parameter fields without action', () => {

        describe('Check field for DefinitionID', () => {

            let field: FormFieldConfiguration;

            before(async () => {
                const manager = new CreateReportActionJobFormManager();
                field = await manager.createOptionField(null, optionsMock.DefinitionID, 'CreateReport', 'TestId', null, null);
            });

            it('Should have the correct property', () => {
                expect(field.property).equals(KIXObjectType.REPORT_DEFINITION);
            });

            it('Should have the correct input component', () => {
                expect(field.inputComponent).equals('object-reference-input');
            });

            it('Should be required', () => {
                expect(field.required).true;
            });

            it('Should have the correct option for object reference', () => {
                const option = field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                expect(option).exist;
                expect(option.value).equals(KIXObjectType.REPORT_DEFINITION);
            });

            it('Should be a single select input', () => {
                const option = field.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                expect(option).exist;
                expect(option.value).false;
            });

        });

        describe('Check field for Parameters', () => {

            let field: FormFieldConfiguration;

            before(async () => {
                const manager = new CreateReportActionJobFormManager();
                field = await manager.createOptionField(null, optionsMock.Parameters, 'CreateReport', 'TestId', null, null);
            });

            it('Should have the correct property', () => {
                expect(field.property).equals(ReportDefinitionProperty.PARAMTER);
            });

            it('Should have the correct input component', () => {
                expect(field.inputComponent).null;
            });

            it('Should be configured asStructure=true', () => {
                expect(field.asStructure).true;
            });

            it('Should not be required', () => {
                expect(field.required).false;
            });

            it('Should have default value = 1', () => {
                expect(field.defaultValue).exist;
                expect(field.defaultValue.value).exist;
                expect(field.defaultValue.value).equals(1);
            });

        });

        describe('Check field for Output Format', () => {

            let field: FormFieldConfiguration;

            before(async () => {
                const manager = new CreateReportActionJobFormManager();
                field = await manager.createOptionField(null, optionsMock.OutputFormat, 'CreateReport', 'TestId', null, null);
            });

            it('Should have the correct property', () => {
                expect(field.property).equals(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
            });

            it('Should have the correct input component', () => {
                expect(field.inputComponent).equals('object-reference-input');
            });

            it('Should be configured asStructure=true', () => {
                expect(field.asStructure).true;
            });

            it('Should be required', () => {
                expect(field.required).true;
            });

        });
    });

    describe('Create the parameter fields with existing action', () => {

        describe('Check field for DefinitionID', () => {

            let field: FormFieldConfiguration;

            before(async () => {
                const manager = new CreateReportActionJobFormManager();
                field = await manager.createOptionField(actionMock as any, optionsMock.DefinitionID, 'CreateReport', 'TestId', null, null);
            });

            it('Should have the correct property', () => {
                expect(field.property).equals(KIXObjectType.REPORT_DEFINITION);
            });

            it('Should have the correct input component', () => {
                expect(field.inputComponent).equals('object-reference-input');
            });

            it('Should be required', () => {
                expect(field.required).true;
            });

            it('Should have the correct option for object reference', () => {
                const option = field.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                expect(option).exist;
                expect(option.value).equals(KIXObjectType.REPORT_DEFINITION);
            });

            it('Should be a single select input', () => {
                const option = field.options.find((o) => o.option === ObjectReferenceOptions.MULTISELECT);
                expect(option).exist;
                expect(option.value).false;
            });

            it('Should have the correct DefinitionID as default value', () => {
                expect(field.defaultValue).exist;
                expect(field.defaultValue.value).exist;
                expect(field.defaultValue.value).equals(2);
            });
        });

        describe('Check field for Parameters', () => {

            let field: FormFieldConfiguration;
            let originalFunction;

            before(async () => {
                originalFunction = KIXObjectService.loadObjects;
                KIXObjectService.loadObjects = async <T extends KIXObject>(objectType: KIXObjectType): Promise<T[]> => {
                    if (objectType === KIXObjectType.REPORT_OUTPUT_FORMAT) {
                        return [csvOutputFormatMock as any];
                    } else if (objectType === KIXObjectType.REPORT_DEFINITION) {
                        return [reportDefinitionsMock as any];
                    }
                    return [];
                }

                const manager = new CreateReportActionJobFormManager();
                const formInstance = new FormInstance(null);
                field = await manager.createOptionField(actionMock as any, optionsMock.Parameters, 'CreateReport', 'TestId', null, formInstance);
            });

            after(() => {
                KIXObjectService.loadObjects = originalFunction;
            });

            it('Should have the correct property', () => {
                expect(field.property).equals(ReportDefinitionProperty.PARAMTER);
            });

            it('Should have the correct input component', () => {
                expect(field.inputComponent).null;
            });

            it('Should be configured asStructure=true', () => {
                expect(field.asStructure).true;
            });

            it('Should not be required', () => {
                expect(field.required).false;
            });

            it('Should have default value = 1', () => {
                expect(field.defaultValue).exist;
                expect(field.defaultValue.value).exist;
                expect(field.defaultValue.value).equals(1);
            });

            describe('Check parameter value fields', () => {

                it('Should have children fields', () => {
                    expect(field.children).exist;
                    expect(field.children).an('array');
                });

                it('Should have 3 children fields', () => {
                    expect(field.children.length).equals(3);
                });

                describe('Check StartDate field', () => {

                    let childField: FormFieldConfiguration;

                    before(() => {
                        childField = field.children.find((f) => f.id === 'StartDate');
                    });

                    it('Should hava the child field', () => {
                        expect(childField).exist;
                    });

                    it('Should have the correct input component "date-time-input"', () => {
                        expect(childField.inputComponent).equals('date-time-input');
                    });

                    it('Should have the field option INPUT_FIELD_TYPE=DATE', () => {
                        const option = childField.options.find((o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE);
                        expect(option).exist;
                        expect(option.value).equals(InputFieldTypes.DATE);
                    });

                    it('Should have the correct default value', () => {
                        expect(childField.defaultValue).exist;
                        expect(childField.defaultValue.value).exist;
                        expect(childField.defaultValue.value).equals('2021-04-10');
                    });
                });

                describe('Check EndDate field', () => {

                    let childField: FormFieldConfiguration;

                    before(() => {
                        childField = field.children.find((f) => f.id === 'EndDate');
                    });

                    it('Should hava the child field', () => {
                        expect(childField).exist;
                    });

                    it('Should have the correct input component "date-time-input"', () => {
                        expect(childField.inputComponent).equals('date-time-input');
                    });

                    it('Should have the field option INPUT_FIELD_TYPE=DATE', () => {
                        const option = childField.options.find((o) => o.option === FormFieldOptions.INPUT_FIELD_TYPE);
                        expect(option).exist;
                        expect(option.value).equals(InputFieldTypes.DATE);
                    });

                    it('Should have the correct default value', () => {
                        expect(childField.defaultValue).exist;
                        expect(childField.defaultValue.value).exist;
                        expect(childField.defaultValue.value).equals('2021-04-16');
                    });
                });

                describe('Check OrganisationIDList field', () => {

                    let childField: FormFieldConfiguration;

                    before(() => {
                        childField = field.children.find((f) => f.id === 'OrganisationIDList');
                    });

                    it('Should hava the child field', () => {
                        expect(childField).exist;
                    });

                    it('Should have the correct input component "object-reference-input"', () => {
                        expect(childField.inputComponent).equals('object-reference-input');
                    });

                    it('Should have the field option OBJECT=Organisation', () => {
                        const option = childField.options.find((o) => o.option === ObjectReferenceOptions.OBJECT);
                        expect(option).exist;
                        expect(option.value).equals(KIXObjectType.ORGANISATION);
                    });

                    it('Should have the correct default value', () => {
                        expect(childField.defaultValue).exist;
                        expect(childField.defaultValue.value).exist;
                        expect(childField.defaultValue.value).an('array');
                        expect(childField.defaultValue.value.length).equals(1);
                        expect(childField.defaultValue.value[0]).equals(1);
                    });
                });
            });

        });

        describe('Check field for Output Format', () => {

            let field: FormFieldConfiguration;
            let originalFunction;

            before(async () => {
                originalFunction = KIXObjectService.loadObjects;
                KIXObjectService.loadObjects = async <T extends KIXObject>(objectType: KIXObjectType): Promise<T[]> => {
                    if (objectType === KIXObjectType.REPORT_OUTPUT_FORMAT) {
                        return [csvOutputFormatMock as any];
                    } else if (objectType === KIXObjectType.REPORT_DEFINITION) {
                        return [reportDefinitionsMock as any];
                    }
                    return [];
                }

                const manager = new CreateReportActionJobFormManager();
                field = await manager.createOptionField(actionMock as any, optionsMock.OutputFormat, 'CreateReport', 'TestId', null, null);
            });

            after(() => {
                KIXObjectService.loadObjects = originalFunction;
            });

            it('Should have the correct property', () => {
                expect(field.property).equals(ReportDefinitionProperty.AVAILABLE_OUTPUT_FORMATS);
            });

            it('Should have the correct input component', () => {
                expect(field.inputComponent).equals('object-reference-input');
            });

            it('Should be configured asStructure=false', () => {
                expect(field.asStructure).false;
            });

            it('Should be required', () => {
                expect(field.required).true;
            });

            it('Should have the correct OutputFormat as default value', () => {
                expect(field.defaultValue).exist;
                expect(field.defaultValue.value).exist;
                expect(Array.isArray(field.defaultValue.value)).true;
                if (Array.isArray(field.defaultValue.value)) {
                    expect(field.defaultValue.value.length).equals(1);
                    expect(field.defaultValue.value[0]).equals("CSV");
                }
            });

        });

    });
});