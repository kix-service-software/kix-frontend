/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultSelectInputFormOption } from '../../../../model/configuration/DefaultSelectInputFormOption';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { KIXObjectTypeImport } from '../../model/KIXObjectTypeImport';
import { ImportConfig } from '../../model/ImportConfig';
import { ImportProperty } from '../../model/ImportProperty';

export class ImportFormService extends KIXObjectFormService {


    private static INSTANCE: ImportFormService;

    public static getInstance(): ImportFormService {
        if (!ImportFormService.INSTANCE) {
            ImportFormService.INSTANCE = new ImportFormService();
        }
        return ImportFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: string): boolean {
        return objectType === KIXObjectTypeImport.IMPORT;
    }

    public async prePrepareForm(
        form: FormConfiguration, kixObject: KIXObject, formInstance: FormInstance
    ): Promise<void> {
        const formGroup = new FormGroupConfiguration(
            'import-form-group-configuration', 'Translatable#Import configurations', [], null, [
            new FormFieldConfiguration(
                'import-form-field-source',
                'Translatable#Source', ImportProperty.SOURCE, 'attachment-input', true,
                // tslint:disable-next-line:max-line-length
                'Translatable#HelptImporConfigext_Import_File',
                [
                    new FormFieldOption('MimeTypes', ['text/', '', 'application/vnd.ms-excel']),
                    new FormFieldOption('MULTI_FILES', false)
                ]
            ),
            new FormFieldConfiguration(
                'import-form-field-charset',
                'Translatable#Charset', ImportProperty.CHARACTER_SET, 'default-select-input', true,
                'Translatable#Helptext_Import_CharacterSet.',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        ImportConfig.getCharacterSet().map((v) => new TreeNode(v.key, v.label))
                    )
                ],
                new FormFieldValue('UTF-8')
            ),
            new FormFieldConfiguration(
                'import-form-field-option',
                'Translatable#Split Option', ImportProperty.VALUE_SEPARATOR, 'default-select-input', true,
                'Translatable#Helptext_Import_ValueSeparator.',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        ImportConfig.getValueSeparator().map((v) => new TreeNode(v.key, v.label))
                    ),
                    new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
                ],
                new FormFieldValue(['COMMA', 'SEMICOLON', 'TAB'])
            ),
            new FormFieldConfiguration(
                'import-form-field-separator',
                'Translatable#Text separator', ImportProperty.TEXT_SEPARATOR, 'default-select-input', true,
                'Translatable#Helptext_Import_TextSeparator.',
                [
                    new FormFieldOption(
                        DefaultSelectInputFormOption.NODES,
                        ImportConfig.getTextSeparator().map((v) => new TreeNode(v.key, v.label))
                    )
                ],
                new FormFieldValue(['DOUBLE'])
            )
        ]);

        const page = new FormPageConfiguration(
            'import-form-page-configuration', 'Import configurations', [], null, null, [formGroup]
        );

        form.pages = [page];
    }

}