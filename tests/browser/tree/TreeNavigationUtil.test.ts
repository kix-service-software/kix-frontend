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
import { TreeNode, TreeUtil, TreeNavigationHandler } from '../../../src/core/model';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / Tree - Keyboard Navigation', () => {

    describe('tree - full expanded - get first visible child (without filter)', () => {

        let tree;
        let navigationHandler: TreeNavigationHandler;

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
            TreeUtil.linkTreeNodes(tree, null);
            navigationHandler = new TreeNavigationHandler();
            navigationHandler.setTree(tree);
        });

        it('Should find the first element', () => {
            const firstElement = navigationHandler.getFirstVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id1');
        });
    });

    describe('tree - full expanded - get first visible child (with filter)', () => {
        let tree;
        let navigationHandler: TreeNavigationHandler;

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
            TreeUtil.linkTreeNodes(tree, 'label2');
            navigationHandler = new TreeNavigationHandler();
            navigationHandler.setTree(tree);
        });

        it('Should find the first visible element', () => {
            const firstElement = navigationHandler.getFirstVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id2');
        });
    });

    describe('tree - full expanded - get last visible child (without filter)', () => {
        let tree;
        let navigationHandler: TreeNavigationHandler;

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
            TreeUtil.linkTreeNodes(tree, null);
            navigationHandler = new TreeNavigationHandler();
            navigationHandler.setTree(tree);
        });

        it('Should find the first element', () => {
            const firstElement = navigationHandler.getLastVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id32');
        });
    });

    describe('tree - full expanded - get last visible child (with filter)', () => {
        let tree;
        let navigationHandler: TreeNavigationHandler;

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
            TreeUtil.linkTreeNodes(tree, 'label2');
            navigationHandler = new TreeNavigationHandler();
            navigationHandler.setTree(tree);
        });

        it('Should find the first visible element', () => {
            const firstElement = navigationHandler.getLastVisibleNode();
            expect(firstElement).exist;
            expect(firstElement.id).equals('id22');
        });
    });

    describe('Navigate trough tree and then filter elements', () => {
        let tree;
        let navigationHandler: TreeNavigationHandler;

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
            TreeUtil.linkTreeNodes(tree, null);
            navigationHandler = new TreeNavigationHandler();
            navigationHandler.setTree(tree);
        });

        it('Should navigate to a child node', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
        });

        it('Should reset the navigation node if node is not longer visible', () => {
            TreeUtil.linkTreeNodes(tree, 'label2');
            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).not.exist;
        });

        it('should start the navigation on the first visible element', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
        });

    });

});
