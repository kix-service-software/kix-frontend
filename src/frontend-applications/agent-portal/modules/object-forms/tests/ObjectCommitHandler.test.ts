/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ObjectCommitHandler } from '../webapp/core/ObjectCommitHandler';
import { TestFormObject } from './MockData';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ObjectCommitHandler', () => {

    describe('Remove all not relevant properties', () => {

        let object: TestFormObject;

        before(async () => {
            object = new TestFormObject();
            object.addBinding('testProperty1', () => null);
            object.addBinding('testProperty2', () => null);
            object.addBinding('testProperty3', () => null);
            object.addBinding('testProperty4', () => null);
            object.addBinding('testProperty5', () => null);

            const commitHandler = new ObjectCommitHandler(null);
            object = await commitHandler.prepareObject(object) as TestFormObject;
        });

        it('should remove property bindings', () => {
            expect((object as any).propertyBindings).not.exist;
        });

        it('should remove displayValues', () => {
            expect(object.displayValues).not.exist;
        });

        it('should remove displayIcons', () => {
            expect(object.displayIcons).not.exist;
        });

        it('should remove DynamicFields if array is empty', () => {
            expect(object.DynamicFields).not.exist;
        });

    });
});