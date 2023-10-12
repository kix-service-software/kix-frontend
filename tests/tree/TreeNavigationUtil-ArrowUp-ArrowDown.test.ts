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
import { TreeHandler, TreeNode } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/tree';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / Tree - Keyboard Navigation - Arrow Up/Down', () => {

    describe('flat list - simple down navigation (ArrowDown) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1'),
                new TreeNode('id2', 'label2'),
                new TreeNode('id3', 'label3')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the first element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the third and last element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id3');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - simple up navigation (ArrowUp) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1'),
                new TreeNode('id2', 'label2'),
                new TreeNode('id3', 'label3')
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the last element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id3');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - simple down navigation (ArrowDown) (with filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'),
                new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'),
                new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'),
                new TreeNode('id23', 'label23')
            ];
            treeHandler = new TreeHandler(tree, null, 'label2');
        });

        it('Should select the first visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the third and last visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id23');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('flat list - simple up navigation (ArrowUp) (with filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id11', 'label11'),
                new TreeNode('id21', 'label21'),
                new TreeNode('id12', 'label12'),
                new TreeNode('id22', 'label22'),
                new TreeNode('id13', 'label13'),
                new TreeNode('id23', 'label23')
            ];
            treeHandler = new TreeHandler(tree, null, 'label2');
        });

        it('Should select the last visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id23');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;
        });
    });

    describe('tree - full expanded - simple down navigation (ArrowDown) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1', null, null, [
                    new TreeNode('id11', 'label11'),
                    new TreeNode('id12', 'label12')
                ], null, null, null, null, true),
                new TreeNode('id2', 'label2', null, null, [
                    new TreeNode('id21', 'label21'),
                    new TreeNode('id22', 'label22')
                ], null, null, null, null, true),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the first root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the third root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id3');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id31');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id32');
            expect(navigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - simple up navigation (ArrowUp) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1', null, null, [
                    new TreeNode('id11', 'label11'),
                    new TreeNode('id12', 'label12')
                ], null, null, null, null, true),
                new TreeNode('id2', 'label2', null, null, [
                    new TreeNode('id21', 'label21'),
                    new TreeNode('id22', 'label22')
                ], null, null, null, null, true),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id32');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id31');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the third root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id3');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - simple down navigation (ArrowDown) (with filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1', null, null, [
                    new TreeNode('id11', 'label11'),
                    new TreeNode('id12', 'label12')
                ], null, null, null, null, true),
                new TreeNode('id2', 'label2', null, null, [
                    new TreeNode('id21', 'label21'),
                    new TreeNode('id22', 'label22')
                ], null, null, null, null, true),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree, null, 'label2');
        });

        it('Should select the second root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - simple up navigation (ArrowUp) (with filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1', null, null, [
                    new TreeNode('id11', 'label11'),
                    new TreeNode('id12', 'label12')
                ], null, null, null, null, true),
                new TreeNode('id2', 'label2', null, null, [
                    new TreeNode('id21', 'label21'),
                    new TreeNode('id22', 'label22')
                ], null, null, null, null, true),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree, null, 'label2');
        });

        it('Should select the second child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the first child', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;
        });

        it('Should select the second root element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;
        });
    });

});