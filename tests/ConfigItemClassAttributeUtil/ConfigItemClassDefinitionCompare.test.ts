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

import { ConfigItemClassAttributeUtil } from '../../src/frontend-applications/agent-portal/modules/cmdb/webapp/core/ConfigItemClassAttributeUtil';
import { TranslationService } from '../../src/frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';
import { ConfigItemClass } from '../../src/frontend-applications/agent-portal/modules/cmdb/model/ConfigItemClass';
import { AttributeDefinition } from '../../src/frontend-applications/agent-portal/modules/cmdb/model/AttributeDefinition';
import { ConfigItemClassDefinition } from '../../src/frontend-applications/agent-portal/modules/cmdb/model/ConfigItemClassDefinition';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / CMDB / ConfigItemClassAttributeUtil - getAttributeDefinitions', () => {

    let orgLoadFunction;
    let orgTranslateFunction;
    before(() => {
        orgLoadFunction = ConfigItemClassAttributeUtil['loadCIClasses'];
        ConfigItemClassAttributeUtil['loadCIClasses'] = someTestFunctions.getClasses;
        orgTranslateFunction = TranslationService.translate;
        TranslationService.translate = someTestFunctions.translate;
    });

    after(() => {
        ConfigItemClassAttributeUtil['loadCIClasses'] = orgLoadFunction;
        TranslationService.translate = orgTranslateFunction;
    });

    describe('compare definitions and return matching attributes', () => {

        it('Should return only matching attributes', async () => {
            const attributes = await ConfigItemClassAttributeUtil.getAttributeDefinitions();

            attributes

            expect(attributes.length).equals(4);
            expect(attributes.some((a) => a.Name === 'NameA / NameA-2 / NameA-3'), 'attribute with name "NameA / NameA-2 / NameA-3" not found').true;
            expect(attributes.some((a) => a.Name === 'SubNameA-A / SubNameA-A-2 / SubNameA-A-3'), 'attribute with name "SubNameA-A / SubNameA-A-2 / SubNameA-A-3" not found').true;
            expect(attributes.some((a) => a.Name === 'NameB / NameB-2'), 'attribute with name "NameB / NameB-2" not found (only unique names)').true;
            expect(attributes.some((a) => a.Name === 'SubNameB-A / SubNameB-A-2 / SubNameB-A-3'), 'attribute with name "SubNameB-A / SubNameB-A-2 / SubNameB-A-3" not found').true;
        });

    });

});

class someTestFunctions {
    public static async translate(pattern: string): Promise<string> {
        return pattern;
    }

    public static async getClasses(): Promise<ConfigItemClass[]> {
        return [
            {
                CurrentDefinition: {
                    Definition: [
                        new AttributeDefinition({
                            Key: 'SameAttribute-A', Name: 'NameA', Input: { Type: 'some-type' },
                            Sub: [
                                new AttributeDefinition({ Key: 'SameSubAttribute-A', Name: 'SubNameA-A', Input: { Type: 'some-type' } } as AttributeDefinition),
                                new AttributeDefinition({ Key: 'SubKeyA-B', Name: 'SubNameA-B', Input: { Type: 'some-type' } } as AttributeDefinition)
                            ]
                        } as AttributeDefinition),
                        new AttributeDefinition({
                            Key: 'SameAttribute-B', Name: 'NameB', Input: { Type: 'some-type' },
                            Sub: [
                                new AttributeDefinition({ Key: 'SameSubAttribute-B', Name: 'SubNameB-A', Input: { Type: 'some-type' } } as AttributeDefinition)
                            ]
                        } as AttributeDefinition),
                        new AttributeDefinition({
                            Key: 'KeyC', Name: 'NameC', Input: { Type: 'some-type' }
                        } as AttributeDefinition)
                    ]
                } as ConfigItemClassDefinition
            } as ConfigItemClass,
            {
                CurrentDefinition: {
                    Definition: [
                        new AttributeDefinition({
                            Key: 'SameAttribute-A', Name: 'NameA-2', Input: { Type: 'some-type' },
                            Sub: [
                                new AttributeDefinition({ Key: 'SameSubAttribute-A', Name: 'SubNameA-A-2', Input: { Type: 'some-type' } } as AttributeDefinition),
                                new AttributeDefinition({ Key: 'SubKeyA-B-2', Name: 'SubNameA-B-2', Input: { Type: 'some-type' } } as AttributeDefinition),
                                new AttributeDefinition({ Key: 'SubKeyA-C-2', Name: 'SubNameA-C-2', Input: { Type: 'some-type' } } as AttributeDefinition)
                            ]
                        } as AttributeDefinition),
                        new AttributeDefinition({
                            Key: 'SameAttribute-B', Name: 'NameB-2', Input: { Type: 'some-type' },
                            Sub: [
                                new AttributeDefinition({ Key: 'SameSubAttribute-B', Name: 'SubNameB-A-2', Input: { Type: 'some-type' } } as AttributeDefinition)
                            ]
                        } as AttributeDefinition)
                    ]
                } as ConfigItemClassDefinition
            } as ConfigItemClass,
            {
                CurrentDefinition: {
                    Definition: [
                        new AttributeDefinition({
                            Key: 'SameAttribute-A', Name: 'NameA-3', Input: { Type: 'some-type' },
                            Sub: [
                                new AttributeDefinition({ Key: 'SameSubAttribute-A', Name: 'SubNameA-A-3', Input: { Type: 'some-type' } } as AttributeDefinition)
                            ]
                        } as AttributeDefinition),
                        new AttributeDefinition({
                            Key: 'SameAttribute-B', Name: 'NameB', Input: { Type: 'some-type' },
                            Sub: [
                                new AttributeDefinition({ Key: 'SameSubAttribute-B', Name: 'SubNameB-A-3', Input: { Type: 'some-type' } } as AttributeDefinition)
                            ]
                        } as AttributeDefinition),
                        new AttributeDefinition({
                            Key: 'KeyC-3', Name: 'NameC-3', Input: { Type: 'some-type' },
                            Sub: [
                                new AttributeDefinition({ Key: 'SameSubAttribute-B', Name: 'SubNameB-A as Sub-C', Input: { Type: 'some-type' } } as AttributeDefinition)
                            ]
                        } as AttributeDefinition)
                    ]
                } as ConfigItemClassDefinition
            } as ConfigItemClass
        ];
    }
}