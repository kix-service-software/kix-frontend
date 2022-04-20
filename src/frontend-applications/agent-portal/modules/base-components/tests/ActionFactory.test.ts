/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ActionFactory } from '../webapp/core/ActionFactory';
import { AbstractAction } from '../webapp/core/AbstractAction';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../../../server/model/rest/CRUD';
import { AuthenticationSocketClient } from '../webapp/core/AuthenticationSocketClient';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ActionFactory', () => {

    describe('register & generate action', () => {

        before(() => {
            ActionFactory.getInstance().registerAction('test-action', TestAction);
        });

        after(() => {
            (ActionFactory.getInstance() as any).actions = new Map();
        });

        it('Should register the action', () => {
            expect(ActionFactory.getInstance().hasAction('test-action')).true;
        });

        it('Should overwrite existing action without error', () => {
            ActionFactory.getInstance().registerAction('test-action', TestAction);
            expect(ActionFactory.getInstance().hasAction('test-action')).true;
        });

        it('should generate the action instance', async () => {
            const actions = await ActionFactory.getInstance().generateActions(['test-action']);
            expect(actions).exist;
            expect(actions).an('array');
            expect(actions.length).equals(1);
            expect(actions[0].id).equals('test-action');
            expect(actions[0]).instanceof(TestAction);
        });

        it('should generate the action instance with correct data', async () => {
            const actions = await ActionFactory.getInstance().generateActions(['test-action'], 'test-data');
            expect(actions).exist;
            expect(actions).an('array');
            expect(actions.length).equals(1);
            expect(actions[0].id).equals('test-action');
            expect(actions[0]).instanceof(TestAction);
            expect(actions[0].data).equals('test-data');
        });

    });

    describe('register multiple actions & generate them', () => {

        before(() => {
            ActionFactory.getInstance().registerAction('test-action1', TestAction);
            ActionFactory.getInstance().registerAction('test-action2', TestAction);
            ActionFactory.getInstance().registerAction('test-action3', TestAction);
            ActionFactory.getInstance().registerAction('test-action4', TestAction);
            ActionFactory.getInstance().registerAction('test-action5', TestAction);
        });

        after(() => {
            (ActionFactory.getInstance() as any).actions = new Map();
        });

        it('Should have all actions registered', () => {
            expect(ActionFactory.getInstance().hasAction('test-action1')).true;
            expect(ActionFactory.getInstance().hasAction('test-action2')).true;
            expect(ActionFactory.getInstance().hasAction('test-action3')).true;
            expect(ActionFactory.getInstance().hasAction('test-action4')).true;
            expect(ActionFactory.getInstance().hasAction('test-action5')).true;
        });

        it('Should generate all actions', async () => {
            const actions = await ActionFactory.getInstance().generateActions(
                [
                    'test-action1',
                    'test-action2',
                    'test-action3',
                    'test-action4',
                    'test-action5'
                ], 'test-data'
            );

            expect(actions).exist;
            expect(actions).an('array');
            expect(actions.length).equals(5);

            expect(actions[0].id).equals('test-action1');
            expect(actions[0]).instanceof(TestAction);
            expect(actions[0].data).equals('test-data');

            expect(actions[1].id).equals('test-action2');
            expect(actions[1]).instanceof(TestAction);
            expect(actions[1].data).equals('test-data');

            expect(actions[2].id).equals('test-action3');
            expect(actions[2]).instanceof(TestAction);
            expect(actions[2].data).equals('test-data');

            expect(actions[3].id).equals('test-action4');
            expect(actions[3]).instanceof(TestAction);
            expect(actions[3].data).equals('test-data');

            expect(actions[4].id).equals('test-action5');
            expect(actions[4]).instanceof(TestAction);
            expect(actions[4].data).equals('test-data');
        })

    });

    describe('Test actions with pemrissions', () => {

        before(() => {
            ActionFactory.getInstance().registerAction('test-action', TestAction);
            ActionFactory.getInstance().registerAction('test-action-ticket', TestActionWithTicketPermissions);
            ActionFactory.getInstance().registerAction('test-action-cmdb', TestActionWithCMDBPermissions);
        });

        after(() => {
            (ActionFactory.getInstance() as any).actions = new Map();
        });

        describe('No Permissions given', () => {

            let checkPermissions;

            before(() => {
                checkPermissions = AuthenticationSocketClient.getInstance().checkPermissions;
                AuthenticationSocketClient.getInstance().checkPermissions = async (permissions: UIComponentPermission[]): Promise<boolean> => {
                    return false;
                };
            });

            after(() => {
                AuthenticationSocketClient.getInstance().checkPermissions = checkPermissions;
            });

            it('should generate only actions without permissions', async () => {
                const actions = await ActionFactory.getInstance().generateActions([
                    'test-action', 'test-action-ticket', 'test-action-cmdb'
                ]);
                expect(actions).exist;
                expect(actions).an('array');
                expect(actions.length).equals(1);
                expect(actions[0].id).equals('test-action');
                expect(actions[0]).instanceof(TestAction);
            });
        });

        describe('Partial Permissions given', () => {

            let checkPermissions;

            before(() => {
                checkPermissions = AuthenticationSocketClient.getInstance().checkPermissions;
                AuthenticationSocketClient.getInstance().checkPermissions = async (permissions: UIComponentPermission[]): Promise<boolean> => {
                    return permissions[0].target === 'ticket';
                };
            });

            after(() => {
                AuthenticationSocketClient.getInstance().checkPermissions = checkPermissions;
            });

            it('should generate only actions without or matching permissions', async () => {
                const actions = await ActionFactory.getInstance().generateActions([
                    'test-action', 'test-action-ticket', 'test-action-cmdb'
                ]);
                expect(actions).exist;
                expect(actions).an('array');
                expect(actions.length).equals(2);
                expect(actions[0].id).equals('test-action');
                expect(actions[0]).instanceof(TestAction);

                expect(actions[1].id).equals('test-action-ticket');
                expect(actions[1]).instanceof(TestActionWithTicketPermissions);
            });
        });

        describe('All Permissions given', () => {

            let checkPermissions;

            before(() => {
                checkPermissions = AuthenticationSocketClient.getInstance().checkPermissions;
                AuthenticationSocketClient.getInstance().checkPermissions = async (permissions: UIComponentPermission[]): Promise<boolean> => {
                    return true;
                };
            });

            after(() => {
                AuthenticationSocketClient.getInstance().checkPermissions = checkPermissions;
            });

            it('should generate only actions without or matching permissions', async () => {
                const actions = await ActionFactory.getInstance().generateActions([
                    'test-action', 'test-action-ticket', 'test-action-cmdb'
                ]);
                expect(actions).exist;
                expect(actions).an('array');
                expect(actions.length).equals(3);
                expect(actions[0].id).equals('test-action');
                expect(actions[0]).instanceof(TestAction);

                expect(actions[1].id).equals('test-action-ticket');
                expect(actions[1]).instanceof(TestActionWithTicketPermissions);

                expect(actions[2].id).equals('test-action-cmdb');
                expect(actions[2]).instanceof(TestActionWithCMDBPermissions);
            });
        });

    });

});

class TestAction extends AbstractAction {

    public initAction(): Promise<void> {
        return;
    }

}

class TestActionWithTicketPermissions extends AbstractAction {

    public permissions = [
        new UIComponentPermission('ticket', [CRUD.READ])
    ]

    public initAction(): Promise<void> {
        return;
    }

}

class TestActionWithCMDBPermissions extends AbstractAction {

    public permissions = [
        new UIComponentPermission('cmdb', [CRUD.READ])
    ]

    public initAction(): Promise<void> {
        return;
    }

}
