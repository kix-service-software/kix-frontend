/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { KIXObject } from '../../src/frontend-applications/agent-portal/model/kix/KIXObject';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { DynamicFieldValue } from '../../src/frontend-applications/agent-portal/modules/dynamic-fields/model/DynamicFieldValue';
import { DynamicFieldValuePlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/dynamic-fields/webapp/core/DynamicFieldValuePlaceholderHandler';
import { KIXObjectService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/KIXObjectService';
import { DynamicField } from '../../src/frontend-applications/agent-portal/modules/dynamic-fields/model/DynamicField';
import { DynamicFieldTypes } from '../../src/frontend-applications/agent-portal/modules/dynamic-fields/model/DynamicFieldTypes';
import { TranslationService } from '../../src/frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for dynamic field values', () => {

    let object: KIXObject;
    let dFValuePlaceholderHandler: DynamicFieldValuePlaceholderHandler = DynamicFieldValuePlaceholderHandler.getInstance();
    let testDFValues: DynamicFieldValue[];
    let orgFuntion;
    let sepatator: string = '###';
    before(() => {
        object = someTestFunctions.prepareObject();

        (TranslationService.getUserLanguage) = async (): Promise<string> => 'en';
        (TranslationService.getInstance() as any).translations = {};

        testDFValues = someTestFunctions.getDynamicFieldValues();

        orgFuntion = KIXObjectService.loadDynamicField;
        KIXObjectService.loadDynamicField = (dfName: string): Promise<DynamicField> => {
            let dynamicField: DynamicField;
            if (dfName) {
                dynamicField = new DynamicField({
                    Name: dfName,
                    FieldType: DynamicFieldTypes.TEXT,
                    ValidID: 1,
                    Config: {
                        ItemSeparator: sepatator
                    }
                } as DynamicField);
                if (dfName === testDFValues[2].Name) {
                    dynamicField.FieldType = DynamicFieldTypes.SELECTION;
                } else if (dfName === testDFValues[3].Name) {
                    dynamicField.FieldType = DynamicFieldTypes.CI_REFERENCE;
                }
            }
            return new Promise((resolve, reject) => {
                resolve(dynamicField);
                reject();
            });
        }
    });

    after(() => {
        KIXObjectService.loadDynamicField = orgFuntion;
        (TranslationService.getInstance() as any).translations = null;
    });

    describe('Replace dynamic field placeholders', async () => {

        it('Should replace text placeholder with value string', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[0].Name}>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[0].Name);
            expect(text).equal(fieldValue.DisplayValue);
        });

        it('Should replace text placeholder with value string (with use of "Value" option)', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[0].Name}_Value>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[0].Name);
            expect(text).equal(fieldValue.DisplayValue);
        });

        it('Should replace text placeholder with html value string (with use of "HTML" option)', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[0].Name}_HTML>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[0].Name);
            expect(text).equal(fieldValue.DisplayValueHTML);
        });

        it('Should replace text placeholder with short value string (with use of "Short" option)', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[0].Name}_Short>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[0].Name);
            expect(text).equal(fieldValue.DisplayValueShort);
        });

        it('Should replace selection placeholder with value string', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[2].Name}>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[2].Name);
            expect(text).equal(fieldValue.DisplayValue);
        });

        it('Should replace selection placeholder with key string', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[2].Name}_Key>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[2].Name);
            expect(text).equal((fieldValue.Value as string[]).join(sepatator));
        });

        it('Should replace CI reference placeholder with value string', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[3].Name}>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[3].Name);
            expect(text).equal(fieldValue.DisplayValue);
        });

        it('Should replace CI refernece placeholder with key string', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[3].Name}_Key>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[3].Name);
            expect(text).equal((fieldValue.Value as string[]).join(sepatator));
        });

        it('Should not replace text placeholder with key string (text does not support "Key" option, use value string instead)', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[0].Name}_Key>`, object);
            const fieldValue = object.DynamicFields.find((v) => v.Name === testDFValues[0].Name);
            expect(text).equal(fieldValue.DisplayValue);
        });

        it('Should not replace text placeholder with value string (used wrong option)', async () => {
            const text = await dFValuePlaceholderHandler.replace(`<KIX_ANY_DynamicField_${testDFValues[0].Name}_Test123>`, object);
            expect(text).equal('');
        });
    });

});

class TextObject extends KIXObject {

    public ObjectId: number;

    public KIXObjectType: KIXObjectType = KIXObjectType.ANY;
}

class someTestFunctions {

    public static getDynamicFieldValues(): DynamicFieldValue[] {
        return [
            new DynamicFieldValue(
                {
                    ID: '1', Name: 'TextDF', Label: 'Text DF',
                    Value: ['Test Text', 'Test Text 2'],
                    DisplayValue: 'Test Text, Test Text 2',
                    DisplayValueHTML: 'HTML',
                    DisplayValueShort: 'short'
                } as DynamicFieldValue
            ),
            new DynamicFieldValue(
                {
                    ID: '1', Name: 'TextAreaDF', Label: 'Text Area DF',
                    Value: ['Test\n Text Area'], DisplayValue: 'Test\n Text Area'
                } as DynamicFieldValue
            ),
            new DynamicFieldValue(
                {
                    ID: '1', Name: 'SelectionDF', Label: 'Selection DF',
                    Value: ['1', '3', '5'], DisplayValue: 'One, Three, Five'
                } as DynamicFieldValue
            ),
            new DynamicFieldValue(
                {
                    ID: '1', Name: 'CIReference', Label: 'CI Reference DF',
                    Value: ['1', '3', '5'], DisplayValue: 'CI1, CI2, CI3'
                } as DynamicFieldValue
            ),
            new DynamicFieldValue(
                {
                    ID: '1', Name: 'DateTimeDF', Label: 'Date Time DF',
                    Value: ['2020-01-13 08:17:30'], DisplayValue: 'ReplaceMe'
                } as DynamicFieldValue
            ),
        ];
    }

    public static prepareObject(): KIXObject {
        const testObject = new TextObject();

        testObject.DynamicFields = this.getDynamicFieldValues();

        return testObject;
    }
}
