/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { FormGroupConfiguration } from '../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../model/configuration/FormPageConfiguration';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FormInstance } from '../../base-components/webapp/core/FormInstance';
import { JobProperty } from '../model/JobProperty';
import { Macro } from '../model/Macro';
import { MacroAction } from '../model/MacroAction';
import { MacroObjectCreator } from '../webapp/core/MacroObjectCreator';

chai.use(chaiAsPromised);
const expect = chai.expect;

const macroField = {
    'id': 'job-form-field-macro',
    'label': 'Translatable#Macro',
    'property': 'Macros',
    'inputComponent': 'job-input-macro',
    'required': false,
    'options': [
        {
            'option': 'MacroId',
            'value': 6
        }
    ],
    'defaultValue': {
        'value': 'Ticket',
        'valid': true
    },
    'fieldConfigurationIds': [],
    'children': [
        {
            'id': 'job-form-field-actions',
            'label': '1. Action',
            'property': 'MACRO_ACTIONS',
            'inputComponent': 'job-input-actions',
            'required': false,
            'hint': 'Sets the incident state of all affected assets of this ticket.',
            'options': [
                {
                    'option': 'ActionId',
                    'value': 15
                }
            ],
            'defaultValue': {
                'value': 'AffectedAssetIncidentStateSet',
                'valid': true
            },
            'fieldConfigurationIds': [],
            'children': [
                {
                    'id': 'job-action-AffectedAssetIncidentStateSet-skip',
                    'label': 'Translatable#Skip',
                    'property': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###SKIP',
                    'inputComponent': 'checkbox-input',
                    'required': false,
                    'hint': 'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip',
                    'options': [
                        {
                            'option': 'OptionName',
                            'value': 'Skip'
                        }
                    ],
                    'defaultValue': {
                        'value': false,
                        'valid': true
                    },
                    'fieldConfigurationIds': [],
                    'children': [],
                    'parentInstanceId': null,
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': false,
                    'asStructure': false,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': 'Translatable#Skip',
                    'draggableFields': false,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###SKIP1610635829935'
                },
                {
                    'id': 'job-action-AffectedAssetIncidentStateSet-Asset',
                    'label': 'Asset',
                    'property': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###Asset',
                    'inputComponent': null,
                    'required': false,
                    'hint': 'The number of the asset to be changed. Separate multiple assets by comma.',
                    'options': [
                        {
                            'option': 'OptionName',
                            'value': 'Asset'
                        }
                    ],
                    'fieldConfigurationIds': [],
                    'children': [],
                    'parentInstanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648',
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': false,
                    'asStructure': false,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': 'Asset',
                    'draggableFields': false,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###Asset'
                },
                {
                    'id': 'job-action-AffectedAssetIncidentStateSet-AssetID',
                    'label': 'AssetID',
                    'property': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###AssetID',
                    'inputComponent': null,
                    'required': false,
                    'hint': 'The ID of the asset to be changed. Separate multiple assets by comma.',
                    'options': [
                        {
                            'option': 'OptionName',
                            'value': 'AssetID'
                        }
                    ],
                    'defaultValue': {
                        'value': '<KIX_TICKET_DynamicField_AffectedAsset_Key>',
                        'valid': true
                    },
                    'fieldConfigurationIds': [],
                    'children': [],
                    'parentInstanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648',
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': false,
                    'asStructure': false,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': 'AssetID',
                    'draggableFields': false,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###AssetID'
                },
                {
                    'id': 'job-action-AffectedAssetIncidentStateSet-IncidentState',
                    'label': 'Incident State',
                    'property': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###IncidentState',
                    'inputComponent': null,
                    'required': true,
                    'hint': 'The name of the incident state to be set.',
                    'options': [
                        {
                            'option': 'OptionName',
                            'value': 'IncidentState'
                        }
                    ],
                    'defaultValue': {
                        'value': 'Operational',
                        'valid': true
                    },
                    'fieldConfigurationIds': [],
                    'children': [],
                    'parentInstanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648',
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': false,
                    'asStructure': false,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': 'Incident State',
                    'draggableFields': false,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###IncidentState'
                },
                {
                    'id': 'job-action-AffectedAssetIncidentStateSet-Force',
                    'label': 'Force',
                    'property': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###Force',
                    'inputComponent': null,
                    'required': false,
                    'hint': 'The incident state \'Incident\' can only be overridden, if there are no open and unsatisfied incident tickets for the asset. Set Force to 1 to force the state regardless of the situation.',
                    'options': [
                        {
                            'option': 'OptionName',
                            'value': 'Force'
                        }
                    ],
                    'defaultValue': {
                        'value': 0,
                        'valid': true
                    },
                    'fieldConfigurationIds': [],
                    'children': [],
                    'parentInstanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648',
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': false,
                    'asStructure': false,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': 'Force',
                    'draggableFields': false,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648###Force'
                }
            ],
            'parentInstanceId': '###MACRO###1610635875861',
            'countDefault': 1,
            'countMax': 200,
            'countMin': 0,
            'maxLength': null,
            'regEx': null,
            'regExErrorMessage': null,
            'empty': false,
            'asStructure': false,
            'readonly': false,
            'placeholder': null,
            'existingFieldId': null,
            'showLabel': true,
            'name': '1. Action',
            'draggableFields': false,
            'type': 'FormField',
            'visible': true,
            'instanceId': '###MACRO###1610635875861###MACRO###MACRO_ACTIONS###1610635880648'
        }
    ],
    'parentInstanceId': null,
    'countDefault': null,
    'countMax': null,
    'countMin': null,
    'maxLength': null,
    'regEx': null,
    'regExErrorMessage': null,
    'empty': true,
    'asStructure': true,
    'readonly': false,
    'placeholder': null,
    'existingFieldId': null,
    'showLabel': true,
    'name': '',
    'draggableFields': true,
    'type': 'FormField',
    'visible': true,
    'instanceId': '###MACRO###1610635875861'
};

const macroFieldWithLoopAction = {
    'id': 'job-form-field-macro',
    'label': 'Translatable#Macro',
    'property': 'Macros',
    'inputComponent': 'job-input-macro',
    'required': false,
    'options': [
        {
            'option': 'MacroId',
            'value': 14
        }
    ],
    'defaultValue': {
        'value': 'Ticket',
        'valid': true
    },
    'fieldConfigurationIds': [],
    'children': [
        {
            'id': 'job-form-field-actions',
            'label': '1. Action',
            'property': 'MACRO_ACTIONS',
            'inputComponent': 'job-input-actions',
            'required': false,
            'hint': 'Execute a loop over each of the given values. Each value will be the new ObjectID for the depending macro.',
            'options': [
                {
                    'option': 'ActionId',
                    'value': 23
                }
            ],
            'defaultValue': {
                'value': 'Loop',
                'valid': true
            },
            'fieldConfigurationIds': [],
            'children': [
                {
                    'id': 'job-action-Loop-skip',
                    'label': 'Translatable#Skip',
                    'property': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###SKIP',
                    'inputComponent': 'checkbox-input',
                    'required': false,
                    'hint': 'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip',
                    'options': [
                        {
                            'option': 'OptionName',
                            'value': 'Skip'
                        }
                    ],
                    'defaultValue': {
                        'value': false,
                        'valid': true
                    },
                    'fieldConfigurationIds': [],
                    'children': [],
                    'parentInstanceId': null,
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': false,
                    'asStructure': false,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': 'Translatable#Skip',
                    'draggableFields': false,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###SKIP1610635400595'
                },
                {
                    'id': 'job-action-Loop-Values',
                    'label': 'Values',
                    'property': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###Values',
                    'inputComponent': null,
                    'required': true,
                    'hint': 'A list of values to go through. Either a comma separated list or an array generated by a placeholder.',
                    'options': [
                        {
                            'option': 'OptionName',
                            'value': 'Values'
                        }
                    ],
                    'defaultValue': {
                        'value': '1,2',
                        'valid': true
                    },
                    'fieldConfigurationIds': [],
                    'children': [],
                    'parentInstanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772',
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': false,
                    'asStructure': false,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': 'Values',
                    'draggableFields': false,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###Values'
                },
                {
                    'id': 'job-form-field-macro',
                    'label': 'Translatable#Macro',
                    'property': 'Macros',
                    'inputComponent': 'job-input-macro',
                    'required': false,
                    'options': [
                        {
                            'option': 'MacroId',
                            'value': 16
                        },
                        {
                            'option': 'OptionName',
                            'value': 'MacroID'
                        }
                    ],
                    'defaultValue': {
                        'value': 'Ticket',
                        'valid': true
                    },
                    'fieldConfigurationIds': [],
                    'children': [
                        {
                            'id': 'job-form-field-actions',
                            'label': '1. Action',
                            'property': 'MACRO_ACTIONS',
                            'inputComponent': 'job-input-actions',
                            'required': false,
                            'hint': 'Accounts time for a ticket.',
                            'options': [
                                {
                                    'option': 'ActionId',
                                    'value': 24
                                }
                            ],
                            'defaultValue': {
                                'value': 'HistoryCleanup',
                                'valid': true
                            },
                            'fieldConfigurationIds': [],
                            'children': [
                                {
                                    'id': 'job-action-AccountTime-skip',
                                    'label': 'Translatable#Skip',
                                    'property': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635387338###SKIP',
                                    'inputComponent': 'checkbox-input',
                                    'required': false,
                                    'hint': 'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip',
                                    'options': [
                                        {
                                            'option': 'OptionName',
                                            'value': 'Skip'
                                        }
                                    ],
                                    'defaultValue': {
                                        'value': false,
                                        'valid': true
                                    },
                                    'fieldConfigurationIds': [],
                                    'children': [],
                                    'parentInstanceId': null,
                                    'countDefault': null,
                                    'countMax': null,
                                    'countMin': null,
                                    'maxLength': null,
                                    'regEx': null,
                                    'regExErrorMessage': null,
                                    'empty': false,
                                    'asStructure': false,
                                    'readonly': false,
                                    'placeholder': null,
                                    'existingFieldId': null,
                                    'showLabel': true,
                                    'name': 'Translatable#Skip',
                                    'draggableFields': false,
                                    'type': 'FormField',
                                    'visible': true,
                                    'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635387338###SKIP1610635451763'
                                },
                                {
                                    'id': 'job-action-AccountTime-AccountTime',
                                    'label': 'Account Time',
                                    'property': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635387338###AccountTime',
                                    'inputComponent': 'number-input',
                                    'required': true,
                                    'hint': 'An integer value (negative possible) which will be accounted for a ticket (as minutes).',
                                    'options': [
                                        {
                                            'option': 'STEP',
                                            'value': 1
                                        },
                                        {
                                            'option': 'EXCEPTS_EMPTY',
                                            'value': true
                                        },
                                        {
                                            'option': 'UNIT_STRING',
                                            'value': 'Translatable#Minutes'
                                        },
                                        {
                                            'option': 'OptionName',
                                            'value': 'AccountTime'
                                        }
                                    ],
                                    'defaultValue': {
                                        'value': null,
                                        'valid': true
                                    },
                                    'fieldConfigurationIds': null,
                                    'children': null,
                                    'parentInstanceId': null,
                                    'countDefault': null,
                                    'countMax': null,
                                    'countMin': null,
                                    'maxLength': null,
                                    'regEx': '^-?\\d+$',
                                    'regExErrorMessage': 'Translatable#Account time has to be an integer.',
                                    'empty': false,
                                    'asStructure': false,
                                    'readonly': false,
                                    'placeholder': null,
                                    'existingFieldId': null,
                                    'showLabel': true,
                                    'name': 'Account Time',
                                    'draggableFields': false,
                                    'defaultHint': 'An integer value (negative possible) which will be accounted for a ticket (as minutes).',
                                    'type': 'FormField',
                                    'visible': true,
                                    'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635387338###AccountTime1610635388214'
                                }
                            ],
                            'parentInstanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795',
                            'countDefault': 1,
                            'countMax': 200,
                            'countMin': 0,
                            'maxLength': null,
                            'regEx': null,
                            'regExErrorMessage': null,
                            'empty': false,
                            'asStructure': false,
                            'readonly': false,
                            'placeholder': null,
                            'existingFieldId': null,
                            'showLabel': true,
                            'name': '1. Action',
                            'draggableFields': false,
                            'type': 'FormField',
                            'visible': true,
                            'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635387338'
                        },
                        {
                            'id': 'job-form-field-actions',
                            'label': '2. Action',
                            'property': 'MACRO_ACTIONS',
                            'inputComponent': 'job-input-actions',
                            'required': false,
                            'hint': 'Sets the owner of a ticket.',
                            'options': [
                                {
                                    'option': 'ActionId',
                                    'value': 24
                                }
                            ],
                            'defaultValue': {
                                'value': 'HistoryCleanup',
                                'valid': true
                            },
                            'fieldConfigurationIds': [],
                            'children': [
                                {
                                    'id': 'job-action-OwnerSet-skip',
                                    'label': 'Translatable#Skip',
                                    'property': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635402394###SKIP',
                                    'inputComponent': 'checkbox-input',
                                    'required': false,
                                    'hint': 'Translatable#Helptext_Admin_JobCreateEdit_ActionSkip',
                                    'options': [
                                        {
                                            'option': 'OptionName',
                                            'value': 'Skip'
                                        }
                                    ],
                                    'defaultValue': {
                                        'value': false,
                                        'valid': true
                                    },
                                    'fieldConfigurationIds': [],
                                    'children': [],
                                    'parentInstanceId': null,
                                    'countDefault': null,
                                    'countMax': null,
                                    'countMin': null,
                                    'maxLength': null,
                                    'regEx': null,
                                    'regExErrorMessage': null,
                                    'empty': false,
                                    'asStructure': false,
                                    'readonly': false,
                                    'placeholder': null,
                                    'existingFieldId': null,
                                    'showLabel': true,
                                    'name': 'Translatable#Skip',
                                    'draggableFields': false,
                                    'type': 'FormField',
                                    'visible': true,
                                    'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635402394###SKIP1610635423341'
                                },
                                {
                                    'id': 'job-action-OwnerSet-OwnerLoginOrID',
                                    'label': 'Owner',
                                    'property': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635402394###OwnerLoginOrID',
                                    'inputComponent': null,
                                    'required': true,
                                    'hint': 'The ID or login of the agent to be set.',
                                    'options': [
                                        {
                                            'option': 'OptionName',
                                            'value': 'OwnerLoginOrID'
                                        }
                                    ],
                                    'fieldConfigurationIds': [],
                                    'children': [],
                                    'parentInstanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635402394',
                                    'countDefault': null,
                                    'countMax': null,
                                    'countMin': null,
                                    'maxLength': null,
                                    'regEx': null,
                                    'regExErrorMessage': null,
                                    'empty': false,
                                    'asStructure': false,
                                    'readonly': false,
                                    'placeholder': null,
                                    'existingFieldId': null,
                                    'showLabel': true,
                                    'name': 'Owner',
                                    'draggableFields': false,
                                    'type': 'FormField',
                                    'visible': true,
                                    'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635402394###OwnerLoginOrID'
                                }
                            ],
                            'parentInstanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795',
                            'countDefault': 1,
                            'countMax': 200,
                            'countMin': 0,
                            'maxLength': null,
                            'regEx': null,
                            'regExErrorMessage': null,
                            'empty': false,
                            'asStructure': false,
                            'readonly': false,
                            'placeholder': null,
                            'existingFieldId': null,
                            'showLabel': true,
                            'name': '1. Action',
                            'draggableFields': false,
                            'type': 'FormField',
                            'visible': true,
                            'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795###MACRO###MACRO_ACTIONS###1610635402394'
                        }
                    ],
                    'parentInstanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772',
                    'countDefault': null,
                    'countMax': null,
                    'countMin': null,
                    'maxLength': null,
                    'regEx': null,
                    'regExErrorMessage': null,
                    'empty': true,
                    'asStructure': true,
                    'readonly': false,
                    'placeholder': null,
                    'existingFieldId': null,
                    'showLabel': true,
                    'name': '',
                    'draggableFields': true,
                    'type': 'FormField',
                    'visible': true,
                    'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772###MACRO###1610635367795'
                }
            ],
            'parentInstanceId': '###MACRO###1610635352036',
            'countDefault': 1,
            'countMax': 200,
            'countMin': 0,
            'maxLength': null,
            'regEx': null,
            'regExErrorMessage': null,
            'empty': false,
            'asStructure': false,
            'readonly': false,
            'placeholder': null,
            'existingFieldId': null,
            'showLabel': true,
            'name': '1. Action',
            'draggableFields': false,
            'type': 'FormField',
            'visible': true,
            'instanceId': '###MACRO###1610635352036###MACRO###MACRO_ACTIONS###1610635366772'
        }
    ],
    'parentInstanceId': null,
    'countDefault': null,
    'countMax': null,
    'countMin': null,
    'maxLength': null,
    'regEx': null,
    'regExErrorMessage': null,
    'empty': true,
    'asStructure': true,
    'readonly': false,
    'placeholder': null,
    'existingFieldId': null,
    'showLabel': true,
    'name': '',
    'draggableFields': true,
    'type': 'FormField',
    'visible': true,
    'instanceId': '###MACRO###1610635352036'
};

describe('MacroObjectCreator', () => {

    describe('Create a Macro object with one action', () => {

        let formInstance: FormInstance;

        let macroObject: Macro;

        before(async () => {
            formInstance = new FormInstance(null);

            const jobNameField = new FormFieldConfiguration('', '', JobProperty.NAME, null);
            jobNameField.instanceId = JobProperty.NAME;

            // create a form mock
            const jobTypeField = new FormFieldConfiguration('', '', JobProperty.TYPE, null);
            jobTypeField.instanceId = JobProperty.TYPE;

            const form = new FormConfiguration(
                '', '', [], KIXObjectType.JOB, true, FormContext.EDIT, null,
                [
                    new FormPageConfiguration(
                        '', '', [], false, false,
                        [
                            new FormGroupConfiguration(
                                '', '', [], '',
                                [
                                    jobNameField, jobTypeField
                                ]
                            )
                        ]
                    )
                ]
            );
            (formInstance as any).form = form;

            await formInstance.provideFormFieldValues(
                [
                    [JobProperty.NAME, 'PutAssetIntoIncidentState'],
                    [JobProperty.TYPE, KIXObjectType.TICKET]
                ],
                null
            );

            await setFormValues(macroField as any, formInstance);

            macroObject = await MacroObjectCreator.createMacro(macroField as any, formInstance);
        });

        it('Should create a valid Macro object', () => {
            checkMacro(macroObject, macroField as any, formInstance);
        });

        it('Should create a valid Action object', () => {
            const action = macroObject.Actions[0];
            const actionField = macroField.children[0];
            checkMacroAction(action, actionField as any, formInstance);
        });

        it('Should set the Action ValidID based on skip option', () => {
            const action = macroObject.Actions[0];
            const actionField = macroField.children[0];
            checkMacroActionValidID(action, actionField as any, formInstance);
        });

        it('Should set the correct Action Parameter', () => {
            const action = macroObject.Actions[0];
            const actionField = macroField.children[0];
            checkMacroActionParameter(action, actionField as any, formInstance);
        });

    });

    describe('Create a Macro object with Loop action', () => {

        let formInstance: FormInstance;

        let macroObject: Macro;

        before(async () => {
            formInstance = new FormInstance(null);

            const jobNameField = new FormFieldConfiguration('', '', JobProperty.NAME, null);
            jobNameField.instanceId = JobProperty.NAME;

            // create a form mock
            const jobTypeField = new FormFieldConfiguration('', '', JobProperty.TYPE, null);
            jobTypeField.instanceId = JobProperty.TYPE;

            const form = new FormConfiguration(
                '', '', [], KIXObjectType.JOB, true, FormContext.EDIT, null,
                [
                    new FormPageConfiguration(
                        '', '', [], false, false,
                        [
                            new FormGroupConfiguration(
                                '', '', [], '',
                                [
                                    jobNameField, jobTypeField
                                ]
                            )
                        ]
                    )
                ]
            );
            (formInstance as any).form = form;

            await formInstance.provideFormFieldValues(
                [
                    [JobProperty.NAME, 'Loop'],
                    [JobProperty.TYPE, KIXObjectType.TICKET]
                ],
                null
            );

            await setFormValues(macroFieldWithLoopAction as any, formInstance);

            macroObject = await MacroObjectCreator.createMacro(macroFieldWithLoopAction as any, formInstance);
        });

        it('Should create a valid Macro object', () => {
            checkMacro(macroObject, macroFieldWithLoopAction as any, formInstance);
        });

        it('Should create a valid Action object', () => {
            const action = macroObject.Actions[0];
            const actionField = macroFieldWithLoopAction.children[0];
            checkMacroAction(action, actionField as any, formInstance);
        });

        it('Should set the Action ValidID based on skip option', () => {
            const action = macroObject.Actions[0];
            const actionField = macroFieldWithLoopAction.children[0];
            checkMacroActionValidID(action, actionField as any, formInstance);
        });

        it('Should set the correct Action Parameter', () => {
            const action = macroObject.Actions[0];
            const actionField = macroFieldWithLoopAction.children[0];
            checkMacroActionParameter(action, actionField as any, formInstance);
        });

        it('Should have a SubMacro as action parameter', () => {
            const action = macroObject.Actions[0];
            const actionField = macroFieldWithLoopAction.children[0];

            const subMacro = action.Parameters['MacroID'];
            const subMacroField = actionField.children.find((o) => o.property === JobProperty.MACROS);

            checkMacro(subMacro, subMacroField as any, formInstance, false);
        });

        it('SubMacro should have two valid actions', () => {
            const action = macroObject.Actions[0];
            const actionField = macroFieldWithLoopAction.children[0];

            const subMacro: Macro = action.Parameters['MacroID'];
            const subMacroField = actionField.children.find((o) => o.property === JobProperty.MACROS);

            expect(subMacro.Actions).an('array');
            expect(subMacro.Actions.length).equals(2);

            const subAction1 = subMacro.Actions[0];
            const subActionField1 = subMacroField.children[0];
            checkMacroAction(subAction1, subActionField1, formInstance);

            const subAction2 = subMacro.Actions[1];
            const subActionField2 = subMacroField.children[0];
            checkMacroAction(subAction2, subActionField2, formInstance);
        });

        it('Sub actions of SubMacro should have correct parameters', () => {
            const action = macroObject.Actions[0];
            const actionField = macroFieldWithLoopAction.children[0];

            const subMacro: Macro = action.Parameters['MacroID'];
            const subMacroField = actionField.children.find((o) => o.property === JobProperty.MACROS);

            const subAction1 = subMacro.Actions[0];
            const subActionField1 = subMacroField.children[0];
            checkMacroActionParameter(subAction1, subActionField1, formInstance);

            const subAction2 = subMacro.Actions[1];
            const subActionField2 = subMacroField.children[0];
            checkMacroActionParameter(subAction2, subActionField2, formInstance);
        });

    });

});

async function setFormValues(field: FormFieldConfiguration, formInstance: FormInstance): Promise<void> {
    if (field.defaultValue) {
        await formInstance.provideFormFieldValues([[field.instanceId, field.defaultValue.value]], null);
    }

    if (Array.isArray(field.children) && field.children.length) {
        for (const f of field.children) {
            await setFormValues(f, formInstance);
        }
    }
}

function checkMacro(macro: Macro, field: FormFieldConfiguration, formInstance: FormInstance, checkComment: boolean = true): void {
    expect(macro).exist;
    expect(field).exist;

    const macroIdOption = field.options.find((o) => o.option === 'MacroId');
    expect(macroIdOption).exist;
    expect(macro.ID).equals(macroIdOption.value);

    if (checkComment) {
        const nameValue = formInstance.getFormFieldValue(JobProperty.NAME);
        expect(nameValue).exist;
        expect(macro.Comment).equals(`Macro for Job "${nameValue.value}"`);
    }

    const typeValue = formInstance.getFormFieldValue(JobProperty.TYPE);
    expect(typeValue).exist;
    expect(macro.Type).equals(typeValue.value);

    if (Array.isArray(field.children) && field.children.length) {
        expect(macro.Actions).an('array');
        expect(macro.Actions.length).equals(field.children.length);
    }
}

function checkMacroAction(action: MacroAction, field: FormFieldConfiguration, formInstance: FormInstance): void {
    expect(action).exist;
    expect(field).exist;

    const typeValue = formInstance.getFormFieldValue(field.instanceId);
    expect(typeValue).exist;
    expect(typeValue.value).exist;
    expect(action.Type).equals(typeValue.value);

    const actionIdOption = field.options.find((o) => o.option === 'ActionId');
    expect(actionIdOption).exist;
    expect(actionIdOption.value).exist;
    expect(action.ID).equals(actionIdOption.value);
}

function checkMacroActionValidID(action: MacroAction, field: FormFieldConfiguration, formInstance: FormInstance): void {
    expect(action).exist;
    expect(field).exist;
    expect(field.children).an('array');
    expect(field.children.length).greaterThan(0);

    const skipField = field.children[0];
    const skipValue = formInstance.getFormFieldValue(skipField.instanceId);
    expect(skipValue).exist;
    expect(skipValue.value).exist;
    expect(action.ValidID).equals(skipValue.value ? 2 : 1);
}

function checkMacroActionParameter(action: MacroAction, field: FormFieldConfiguration, formInstance: FormInstance): void {
    expect(action).exist;
    expect(field).exist;
    expect(field.children).an('array');
    expect(field.children.length).greaterThan(0);
    expect(action.Parameters).exist;

    const fieldChildren = [...field.children];
    fieldChildren.splice(0, 1);

    for (const f of fieldChildren) {
        const optionNameOption = f.options.find((o) => o.option === 'OptionName');
        expect(optionNameOption).exist;
        expect(optionNameOption.value).exist;

        if (optionNameOption.value === 'MacroID') {
            expect(action.Parameters[optionNameOption.value]).exist;
        } else {
            const fieldValue = formInstance.getFormFieldValue(f.instanceId);

            if (fieldValue && typeof fieldValue.value !== 'undefined' && fieldValue.value !== null) {
                expect(action.Parameters[optionNameOption.value]).exist;
                expect(action.Parameters[optionNameOption.value]).equals(fieldValue.value);
            }
        }
    }

}