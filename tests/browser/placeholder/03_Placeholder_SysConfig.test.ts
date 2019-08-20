/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { SysConfigOptionType, SysConfigOptionDefinition } from '../../../src/core/model';
import { SysConfigPlaceholderHandler } from '../../../src/core/browser/sysconfig';
import { KIXObjectService } from '../../../src/core/browser';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for SysConfig', () => {

    let sysConfigPlaceholderHandler: SysConfigPlaceholderHandler = new SysConfigPlaceholderHandler();
    let orgLoadFuntion
    before(() => {
        orgLoadFuntion = KIXObjectService.loadObjects;
        KIXObjectService.loadObjects = async (objectType, objectIds: string[]) => {
            return someTestFunctions.getSysConfigDefinitions(objectIds) as any[];
        }
    });

    after(() => {
        KIXObjectService.loadObjects = orgLoadFuntion;
    });

    describe('Replace SysConfig placeholder.', async () => {

        it(`Should replace with sysconfig option value of type "${SysConfigOptionType.STRING}" placeholder`, async () => {
            const text = await sysConfigPlaceholderHandler.replace(`<KIX_CONFIG_Type${SysConfigOptionType.STRING}>`);
            const option = someTestFunctions.getSysConfigDefinition(`Type${SysConfigOptionType.STRING}`);
            expect(option).exist;
            expect(text).equal(option.Value);
        });

        it(`Should replace with sysconfig option value of type "${SysConfigOptionType.STRING}" placeholder (Default)`, async () => {
            const text = await sysConfigPlaceholderHandler.replace(`<KIX_CONFIG_Type${SysConfigOptionType.STRING}Default>`);
            const option = someTestFunctions.getSysConfigDefinition(`Type${SysConfigOptionType.STRING}Default`);
            expect(option).exist;
            expect(text).equal(option.Default);
        });

        it(`Should replace with sysconfig option value of type "${SysConfigOptionType.TEXTAREA}" placeholder`, async () => {
            const text = await sysConfigPlaceholderHandler.replace(`<KIX_CONFIG_Type${SysConfigOptionType.TEXTAREA}>`);
            const option = someTestFunctions.getSysConfigDefinition(`Type${SysConfigOptionType.TEXTAREA}`);
            expect(option).exist;
            expect(text).equal(option.Value);
        });

        it(`Should replace with sysconfig option value of type "${SysConfigOptionType.OPTION}" placeholder`, async () => {
            const text = await sysConfigPlaceholderHandler.replace(`<KIX_CONFIG_Type${SysConfigOptionType.OPTION}>`);
            const option = someTestFunctions.getSysConfigDefinition(`Type${SysConfigOptionType.OPTION}`);
            expect(option).exist;
            const value = option.Setting[option.Value];
            expect(text).equal(value);
        });

    });

    describe('Replace placeholder of unknown sysconfig option or of unsupported type with empty string.', async () => {

        it('Should replace unknown sysconfig option placeholder', async () => {
            const text = await sysConfigPlaceholderHandler.replace(`<KIX_CONFIG_UnknownOption>`);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace sysConfig option of unsupported type placeholder', async () => {
            const empty_1 = await sysConfigPlaceholderHandler.replace(`<KIX_CONFIG_>`);
            expect(empty_1).exist;
            expect(empty_1).equal('');
            const empty_2 = await sysConfigPlaceholderHandler.replace(`<KIX_CONFIG_Type${SysConfigOptionType.HASH}>`);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });
});

class someTestFunctions {

    public static getSysConfigDefinitions(objectIds: string[]): SysConfigOptionDefinition[] {
        const sysConfigDefs: SysConfigOptionDefinition[] = [];

        if (!!objectIds.length) {
            const option = someTestFunctions.getSysConfigDefinition(objectIds[0]);
            if (option) {
                sysConfigDefs.push(option);
            }
        }
        console.log(sysConfigDefs);
        return sysConfigDefs;
    }

    public static getSysConfigDefinition(objectId: string): SysConfigOptionDefinition {
        let sysConfigDef: SysConfigOptionDefinition;
        switch (objectId) {
            case `Type${SysConfigOptionType.STRING}`:
                sysConfigDef = new SysConfigOptionDefinition();
                sysConfigDef.Type = SysConfigOptionType.STRING;
                sysConfigDef.Value = 'SimpleStringValue';
                break;
            case `Type${SysConfigOptionType.STRING}Default`:
                sysConfigDef = new SysConfigOptionDefinition();
                sysConfigDef.Type = SysConfigOptionType.STRING;
                sysConfigDef.Default = 'SimpleStringValueDefault';
                break;
            case `Type${SysConfigOptionType.TEXTAREA}`:
                sysConfigDef = new SysConfigOptionDefinition();
                sysConfigDef.Type = SysConfigOptionType.TEXTAREA;
                sysConfigDef.Value = 'TextareaString';
                break;
            case `Type${SysConfigOptionType.OPTION}`:
                sysConfigDef = new SysConfigOptionDefinition();
                sysConfigDef.Type = SysConfigOptionType.OPTION;
                sysConfigDef.Value = '1';
                sysConfigDef.Setting = {
                    '0': 'No',
                    '1': 'Yes'
                };
                break;
            default:
        }

        return sysConfigDef;
    }
}