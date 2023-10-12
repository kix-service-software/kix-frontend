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

describe('Browser / Components / Tree - Keyboard Navigation', () => {

    describe('tree - full expanded - get first visible child (without filter)', () => {

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

        it('Should find the first element', () => {
            const firstElement = treeHandler.navigationHandler.getFirstVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id1');
        });
    });

    describe('tree - full expanded - get first visible child (with filter)', () => {
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

        it('Should find the first visible element', () => {
            const firstElement = treeHandler.navigationHandler.getFirstVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id2');
        });
    });

    describe('tree - full expanded - get last visible child (without filter)', () => {
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

        it('Should find the first element', () => {
            const firstElement = treeHandler.navigationHandler.getLastVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id32');
        });
    });

    describe('tree - full expanded - get last visible child (with filter)', () => {
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

        it('Should find the first visible element', () => {
            const firstElement = treeHandler.navigationHandler.getLastVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id22');
        });
    });

    describe('Navigate trough tree and then filter elements', () => {
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

        it('Should navigate to a child node', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
        });

        it('Should reset the navigation node if node is not longer visible', () => {
            treeHandler = new TreeHandler(tree, null, 'label2');
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).not.exist;
        });

        it('should start the navigation on the first visible element', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
        });

    });

});
