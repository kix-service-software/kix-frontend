/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { PlaceholderService } from '../../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/PlaceholderService';
import { IPlaceholderHandler } from '../../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/IPlaceholderHandler';
import { KIXObject } from '../../../src/frontend-applications/agent-portal/model/kix/KIXObject';

chai.use(chaiAsPromised);
const expect = chai.expect;

const placeholder_1 = '<KIX_TESTHANDLER_Attribute_1>';
const value_1 = 'Value_1';
const placeholder_2 = '<KIX_TESTHANDLER_Attribute_2>';
const value_2 = 'Value_2';
const translationPlaceholder = '<TR_KIX_TESTHANDLER_Attribute_3>';
const value_3 = 'Value_3';
const unknownPlaceholder = '<KIX_UNKNOWN_placeholder>';
const invalidPlaceholder = '<kix_wrong_placeholder>';
const invalidPlaceholder_2 = '<KIX_TESTHANDLER>';
const invalidPlaceholder_3 = '<KIX_TESTHANDLER_>';

describe('Placeholder replacement', () => {

    describe('General placeholder handling', () => {
        const text = `Text with placeholder 1: ${placeholder_1} and placeholder 3: ${translationPlaceholder} and some invalid placeholders ${invalidPlaceholder} and ${invalidPlaceholder_2} and ${invalidPlaceholder_3} and another valid placeholder: ${placeholder_2}.`;
        let testHandler;

        before(() => {
            testHandler = new TestPlaceholderHandler();
        });

        it('Should extract correct placeholder', () => {
            const placeholders: string[] = PlaceholderService.getInstance().extractPlaceholders(text);

            expect(Array.isArray(placeholders), 'should found placeholders').is.true;
            expect(placeholders.length).equal(3);
            expect(placeholders.some((ph) => ph === placeholder_1)).is.true;
            expect(placeholders.some((ph) => ph === placeholder_2)).is.true;
            expect(placeholders.some((ph) => ph === translationPlaceholder)).is.true;
            expect(placeholders.some((ph) => ph === invalidPlaceholder), 'invalid placeholder should not be found as placeholder').is.false;
            expect(placeholders.some((ph) => ph === invalidPlaceholder_2), 'invalid placeholder 2 should not be found as placeholder').is.false;
            expect(placeholders.some((ph) => ph === invalidPlaceholder_3), 'invalid placeholder 3 should not be found as placeholder').is.false;
        });

        it('Should extract correct placeholder (use of &lt; and &gt; for < and >)', () => {
            const alsoValidPlaceholder = '&lt;KIX_TEST_Attribute&gt;';
            const text = `Text with placeholders: ${alsoValidPlaceholder} and <KIX_TEST_Attribute2>`;
            const placeholders: string[] = PlaceholderService.getInstance().extractPlaceholders(text);

            expect(Array.isArray(placeholders), 'should found placeholders').is.true;
            expect(placeholders.length).equal(2);
            expect(placeholders.some((ph) => ph === alsoValidPlaceholder)).is.true;
        });

        it('Should register handler', () => {
            PlaceholderService.getInstance().registerPlaceholderHandler(testHandler);
            expect(Array.isArray(PlaceholderService.getInstance()['placeholderHandler'])).is.true;
            expect(PlaceholderService.getInstance()['placeholderHandler'].length).equal(1);
        });

        it('Should return correct handler', () => {
            expect(Array.isArray(PlaceholderService.getInstance()['placeholderHandler'])).is.true;
            expect(PlaceholderService.getInstance()['placeholderHandler'].length).equal(1);

            const handler: IPlaceholderHandler = PlaceholderService.getInstance()['getHandler']('TESTHANDLER');

            expect(handler).exist;
            expect(handler instanceof TestPlaceholderHandler, 'Handler is not expected handler.').is.true;
        });

        it('Should correctly replace placeholders', async () => {
            const expectedText = `Text with placeholder 1: ${value_1} and placeholder 3: ${value_3} and some invalid placeholders ${invalidPlaceholder} and ${invalidPlaceholder_2} and ${invalidPlaceholder_3} and another valid placeholder: ${value_2}.`;
            const result: string = await PlaceholderService.getInstance().replacePlaceholders(text);
            expect(result).exist;
            expect(!!result.length).is.true;
            expect(result).equal(expectedText);
        });

        it('Should correctly replace unknown placeholder with empty string', async () => {
            const expectedText = `This is a Text with an unknown placeholder:  and an valid known placeholder: ${value_1}.`;
            const text = `This is a Text with an unknown placeholder: ${unknownPlaceholder} and an valid known placeholder: ${placeholder_1}.`;

            const placeholders: string[] = PlaceholderService.getInstance().extractPlaceholders(text);
            expect(Array.isArray(placeholders)).is.true;
            expect(placeholders.length).equal(2);
            expect(placeholders.some((ph) => ph === unknownPlaceholder)).is.true;

            const result: string = await PlaceholderService.getInstance().replacePlaceholders(text);
            expect(result).exist;
            expect(!!result.length).is.true;
            expect(result).equal(expectedText);
        });

        it('Should replace same placeholder with same string', async () => {
            const expectedText = `This is a Text with multiple equal placeholders ${value_1} and ${value_1} and another ${value_1}.`;
            const text = `This is a Text with multiple equal placeholders ${placeholder_1} and ${placeholder_1} and another ${placeholder_1}.`;

            const placeholders: string[] = PlaceholderService.getInstance().extractPlaceholders(text);
            expect(Array.isArray(placeholders)).is.true;
            expect(placeholders.length).equal(3);

            const result: string = await PlaceholderService.getInstance().replacePlaceholders(text);
            expect(result).exist;
            expect(!!result.length).is.true;
            expect(result).equal(expectedText);
        });

        it('Should unregister handler', () => {
            PlaceholderService.getInstance().unregisterPlaceholderHandler(testHandler.handlerId);
            expect(Array.isArray(PlaceholderService.getInstance()['placeholderHandler'])).is.true;
            expect(PlaceholderService.getInstance()['placeholderHandler'].length).equal(0);
        });

    });

});

class TestPlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'test-handler';

    public isHandlerFor(objectString: string): boolean {
        return objectString === 'TESTHANDLER';
    }

    public async replace(placeholder: string, object: KIXObject): Promise<string> {
        switch (placeholder) {
            case placeholder_1:
                return value_1
            case placeholder_2:
                return value_2
            case translationPlaceholder:
                return value_3
            default:
        }
    }
}
