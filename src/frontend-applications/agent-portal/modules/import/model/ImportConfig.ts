/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ImportConfigValue } from './ImportConfigValue';
import { ImportProperty } from './ImportProperty';

export class ImportConfig {

    public static FORM_ID = 'import-dialog-form';

    public static config = new Map(
        [
            [
                ImportProperty.CHARACTER_SET, [
                    new ImportConfigValue('UTF-8', 'UTF 8'),
                    new ImportConfigValue('ISO-8859-1', 'ISO 8859-1'),
                    new ImportConfigValue('ISO-8859-14', 'ISO 8859-14'),
                    new ImportConfigValue('ISO-8859-15', 'ISO 8859-15')
                ]
            ],
            [
                ImportProperty.VALUE_SEPARATOR, [
                    new ImportConfigValue('COMMA', 'Translatable#, (comma)', ','),
                    new ImportConfigValue('SEMICOLON', 'Translatable#; (semicolon)', ';'),
                    new ImportConfigValue('COLON', 'Translatable#: (colon)', ':'),
                    new ImportConfigValue('DOT', 'Translatable#. (dot)', '.'),
                    new ImportConfigValue('TAB', 'Translatable#-> (tab)', '\\t')
                ]
            ],
            [
                ImportProperty.TEXT_SEPARATOR, [
                    new ImportConfigValue('DOUBLE', 'Translatable#DOUBLE_QUOTES', '"'),
                    new ImportConfigValue('SINGLE', 'Translatable#SINGLE_QUOTES', '\'')
                ]
            ]
        ]
    );

    public static getCharacterSet(): ImportConfigValue[] {
        return ImportConfig.config.get(ImportProperty.CHARACTER_SET);
    }

    public static getValueSeparator(): ImportConfigValue[] {
        return ImportConfig.config.get(ImportProperty.VALUE_SEPARATOR);
    }

    public static getTextSeparator(): ImportConfigValue[] {
        return ImportConfig.config.get(ImportProperty.TEXT_SEPARATOR);
    }

}