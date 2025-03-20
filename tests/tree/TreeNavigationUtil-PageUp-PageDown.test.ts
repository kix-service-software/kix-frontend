/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { TreeHandler, TreeNode } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/tree';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / Tree - Keyboard Navigation - Page Up/Down', () => {

    describe('flat list - navigate 10 elements down if no element is selected (PageDown) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'),
                new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'),
                new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'),
                new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'),
                new TreeNode('id24', 'label24'),
                new TreeNode('id15', 'label15'),
                new TreeNode('id25', 'label25'),
                new TreeNode('id16', 'label16'),
                new TreeNode('id26', 'label26'),
                new TreeNode('id17', 'label17'),
                new TreeNode('id27', 'label27'),
                new TreeNode('id18', 'label18'),
                new TreeNode('id28', 'label28')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id25');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - navigate 10 elements down if element is selected (PageDown) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'), new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'), new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'), new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'), new TreeNode('id24', 'label24'),
                new TreeNode('id15', 'label15'), new TreeNode('id25', 'label25'),
                new TreeNode('id16', 'label16'), new TreeNode('id26', 'label26'),
                new TreeNode('id17', 'label17'), new TreeNode('id27', 'label27'),
                new TreeNode('id18', 'label18'), new TreeNode('id28', 'label28')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element after current selection', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;

            treeHandler.navigationHandler.handleEvent({ key: 'PageDown' });
            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id26');
            expect(newNavigationNode.navigationNode).true;
        });
    });

    describe('flat list - navigate 10 elements down twice (PageDown) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'), new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'), new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'), new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'), new TreeNode('id24', 'label24'),
                new TreeNode('id15', 'label15'), new TreeNode('id25', 'label25'),
                new TreeNode('id16', 'label16'), new TreeNode('id26', 'label26'),
                new TreeNode('id17', 'label17'), new TreeNode('id27', 'label27'),
                new TreeNode('id18', 'label18'), new TreeNode('id28', 'label28'),
                new TreeNode('id19', 'label19'), new TreeNode('id29', 'label29'),
                new TreeNode('id110', 'label110'), new TreeNode('id210', 'label210'),
                new TreeNode('id111', 'label111'), new TreeNode('id212', 'label212')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageDown' });
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id25');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the next 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageDown' });
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id210');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - navigate 10 elements down if not 10 more elements available (PageDown) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'), new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'), new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'), new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'), new TreeNode('id24', 'label24')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageDown' });
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id24');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - navigate 10 elements up if no element is selected (PageUp) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'),
                new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'),
                new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'),
                new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'),
                new TreeNode('id24', 'label24'),
                new TreeNode('id15', 'label15'),
                new TreeNode('id25', 'label25'),
                new TreeNode('id16', 'label16'),
                new TreeNode('id26', 'label26'),
                new TreeNode('id17', 'label17'),
                new TreeNode('id27', 'label27'),
                new TreeNode('id18', 'label18'),
                new TreeNode('id28', 'label28')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id14');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - navigate 10 elements up if element is selected (PageUp) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'), new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'), new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'), new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'), new TreeNode('id24', 'label24'),
                new TreeNode('id15', 'label15'), new TreeNode('id25', 'label25'),
                new TreeNode('id16', 'label16'), new TreeNode('id26', 'label26'),
                new TreeNode('id17', 'label17'), new TreeNode('id27', 'label27'),
                new TreeNode('id18', 'label18'), new TreeNode('id28', 'label28')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element after current selection', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id18');
            expect(navigationNode.navigationNode).true;

            treeHandler.navigationHandler.handleEvent({ key: 'PageUp' });
            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id13');
            expect(newNavigationNode.navigationNode).true;
        });
    });

    describe('flat list - navigate 10 elements up twice (PageUp) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'), new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'), new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'), new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'), new TreeNode('id24', 'label24'),
                new TreeNode('id15', 'label15'), new TreeNode('id25', 'label25'),
                new TreeNode('id16', 'label16'), new TreeNode('id26', 'label26'),
                new TreeNode('id17', 'label17'), new TreeNode('id27', 'label27'),
                new TreeNode('id18', 'label18'), new TreeNode('id28', 'label28'),
                new TreeNode('id19', 'label19'), new TreeNode('id29', 'label29'),
                new TreeNode('id110', 'label110'), new TreeNode('id210', 'label210'),
                new TreeNode('id111', 'label111'), new TreeNode('id212', 'label212')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageUp' });
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id17');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the next 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageUp' });
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - navigate 10 elements up if not 10 more elements available (PageUp) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'), new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'), new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'), new TreeNode('id23', 'label23'),
                new TreeNode('id14', 'label14'), new TreeNode('id24', 'label24')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the 10th visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'PageUp' });
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.navigationNode).true;
        });
    });

});