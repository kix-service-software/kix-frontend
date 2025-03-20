/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIconService } from '../../../../icon/webapp/core';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { DynamicFieldTypes } from '../../../model/DynamicFieldTypes';
import { DynamicFieldService } from '../DynamicFieldService';

export class ChecklistSchema {

    // eslint-disable-next-line max-lines-per-function
    public static async registerSchema(): Promise<void> {

        const checkListItemTitle = await TranslationService.translate('Translatable#Checklist Item');
        const itemId = await TranslationService.translate('Translatable#Id');
        const itemTitle = await TranslationService.translate('Translatable#Title');
        const itemDescription = await TranslationService.translate('Translatable#Description');
        const itemInput = await TranslationService.translate('Translatable#Input');
        const itemValue = await TranslationService.translate('Translatable#Value');
        const itemSub = await TranslationService.translate('Translatable#Sub');

        const checklistState = await TranslationService.translate('Translatable#Checklist State');
        const label = await TranslationService.translate('Translatable#Label');
        const done = await TranslationService.translate('Translatable#Done');
        const doneDescription = await TranslationService.translate('Translatable#If true, the value will increase the checklist counter.');
        const showLastChangeDate = await TranslationService.translate('Translatable#Show Last Change Date');
        const showChangeDateDescription = await TranslationService.translate('Translatable#If checked, the last change date will be displayed for this item.');

        let icons = await ObjectIconService.getInstance().getAvailableIcons(
            true, true, false
        );
        icons = [
            '',
            ...icons?.filter((i) => typeof i === 'string').sort((a, b) => a.toString().localeCompare(b.toString()))
        ];

        const schema = {
            type: 'object',
            title: 'Checklist',
            definitions: {
                CommonChecklistState: {
                    title: checklistState,
                    type: 'array',
                    required: false,
                    format: 'table',
                    items: {
                        type: 'object',
                        properties: {
                            value: {
                                title: label,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            icon: {
                                title: 'Icon',
                                type: 'string',
                                uniqueItems: true,
                                enum: icons,
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            done: {
                                title: done,
                                description: doneDescription,
                                type: 'boolean',
                                format: 'checkbox',
                                default: 1,
                                options: {
                                    'grid_columns': 4
                                }
                            }
                        }
                    }
                },
                CheckListItem: {
                    title: checkListItemTitle,
                    description: '',
                    type: 'array',
                    required: false,
                    format: 'tabs',
                    items: {
                        type: 'object',
                        properties: {
                            id: {
                                title: itemId,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            title: {
                                title: itemTitle,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            description: {
                                title: itemDescription,
                                type: 'string',
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            done: {
                                title: done,
                                description: doneDescription,
                                type: 'boolean',
                                format: 'checkbox',
                                default: 1,
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            showLastChangeDate: {
                                title: showLastChangeDate,
                                description: showChangeDateDescription,
                                type: 'boolean',
                                format: 'checkbox',
                                default: 0,
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            input: {
                                title: itemInput,
                                type: 'string',
                                default: 'ChecklistState',
                                enum: [
                                    'Text',
                                    'TextArea',
                                    'ChecklistState'
                                ],
                                options: {
                                    'grid_columns': 4
                                }
                            },
                            value: {
                                dependencies: {
                                    input: ['Text', 'TextArea']
                                },
                                watch: {
                                    input: 'input'
                                },
                                title: itemValue,
                                type: 'string'
                            },
                            inputStates: {
                                $ref: '#/definitions/CommonChecklistState'
                            },
                            sub: {
                                title: itemSub,
                                $ref: '#/definitions/CheckListItem'
                            }
                        }
                    }
                }
            },
            properties: {
                DefaultValue: {
                    $ref: '#/definitions/CheckListItem'
                }
            }
        };

        DynamicFieldService.getInstance().registerConfigSchema(DynamicFieldTypes.CHECK_LIST, schema);
    }


}