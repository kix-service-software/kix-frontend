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

describe('Browser / Components / Tree - Keyboard Navigation - Home/End', () => {

    describe('tree - full expanded - jump to first element if nothing is selected (Pos1) (without filter)', () => {
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
            navigationHandler = new TreeNavigationHandler(); navigationHandler.setTree(tree);
        });

        it('Should select the first element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'Home' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to first element if nothing is selected (Pos1) (with filter)', () => {
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

        it('Should select the first element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'Home' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to first element if element in the tree is selected (Pos1) (without filter)', () => {
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
            navigationHandler = new TreeNavigationHandler(); navigationHandler.setTree(tree);
        });

        it('Should select the first element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;

            navigationHandler.handleEvent({ key: 'Home' });

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id1');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to first element if element in the tree is selected (Pos1) (with filter)', () => {
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

        it('Should select the first element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;

            navigationHandler.handleEvent({ key: 'Home' });

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id2');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to last element if nothing is selected (End) (without filter)', () => {
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

        it('Should select the last element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'End' });

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id32');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to last element if nothing is selected (End) (with filter)', () => {
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

        it('Should select the last element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'End' });

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id22');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to last element if element in the tree is selected (End) (without filter)', () => {
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

        it('Should select the first element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');
            expect(navigationNode.navigationNode).true;

            navigationHandler.handleEvent({ key: 'End' });

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id32');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to last element if element in the tree is selected (End) (with filter)', () => {
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

        it('Should select the first element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;

            navigationHandler.handleEvent({ key: 'End' });

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id22');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - jump to last element if element in the tree is selected (End) (with filter)', () => {
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

        it('Should select the first element in the tree.', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.navigationNode).true;

            navigationHandler.handleEvent({ key: 'End' });

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id22');
            expect(newNavigationNode.navigationNode).true;
        });

    });

});