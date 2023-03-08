/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');

import { CMDBEditUIModule, NewConfigItemDialogContext, EditConfigItemDialogContext } from '../webapp/core';
import { ActionFactory } from '../../base-components/webapp/core/ActionFactory';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('CMDBEditUIModule', () => {

    let cmdbModule: CMDBEditUIModule;

    before(() => {
        cmdbModule = new CMDBEditUIModule();
    });

    describe('Should register the edit module for cmdb', () => {

        it('should register', async () => {
            await cmdbModule.register();
        });

        it('should register the new context for ConfigItemClass', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(NewConfigItemDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register the edit context for ConfigItemClass', () => {
            // const descriptor = ContextService.getInstance().getContextDescriptor(EditConfigItemDialogContext.CONTEXT_ID);
            // expect(descriptor).exist;
        });

        it('should register the ConfigItemEditAction', () => {
            expect(ActionFactory.getInstance().hasAction('config-item-edit-action')).true;
        });
    });

});
