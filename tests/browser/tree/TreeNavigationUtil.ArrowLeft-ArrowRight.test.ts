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

describe('Browser / Components / Tree - Keyboard Navigation - Arrow Left/Right', () => {

    describe('tree - collapsed - expand a root node (ArrowRight) (without filter)', () => {
        let tree;
        let navigationHandler: TreeNavigationHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1', null, null, [
                    new TreeNode('id11', 'label11'),
                    new TreeNode('id12', 'label12')
                ]),
                new TreeNode('id2', 'label2', null, null, [
                    new TreeNode('id21', 'label21'),
                    new TreeNode('id22', 'label22')
                ]),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ])
            ];
            TreeUtil.linkTreeNodes(tree, null);
            navigationHandler = new TreeNavigationHandler();
            navigationHandler.setTree(tree);
            navigationHandler.handleEvent({ key: 'ArrowDown' });
        });

        it('Should expand the node and navigate to first child', () => {
            const node = navigationHandler.findNavigationNode();
            expect(node).exist;
            expect(node.id).equals('id1');

            navigationHandler.handleEvent({ key: 'ArrowRight' });

            expect(node.expanded).true;

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id11');
        });
    });

    describe('tree - collapsed - expand a root node (ArrowRight) (with filter)', () => {
        let tree;
        let navigationHandler: TreeNavigationHandler;

        before(() => {
            tree = [
                new TreeNode('id1', 'label1', null, null, [
                    new TreeNode('id11', 'label11'),
                    new TreeNode('id12', 'label12')
                ]),
                new TreeNode('id2', 'label2', null, null, [
                    new TreeNode('id21', 'label21'),
                    new TreeNode('id22', 'label22')
                ]),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ])
            ];
            TreeUtil.linkTreeNodes(tree, 'label22');
            navigationHandler = new TreeNavigationHandler();
            navigationHandler.setTree(tree);

            navigationHandler.handleEvent({ key: 'ArrowDown' });
        });

        it('Should expand the node and navigate to first visible child', () => {
            const node = navigationHandler.findNavigationNode();
            expect(node).exist;
            expect(node.id).equals('id2');

            navigationHandler.handleEvent({ key: 'ArrowRight' }, 'label22');

            expect(node.expanded).true;

            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id22');
        });
    });

    describe('tree - full expanded - collapse root node (ArrowLeft)', () => {
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

        it('Should collapse the root node', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;

            navigationHandler.handleEvent({ key: 'ArrowLeft' });
            expect(navigationNode.expanded).false;

            navigationHandler.handleEvent({ key: 'ArrowDown' });
            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id3');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - collapse tree if child is focused (ArrowLeft)', () => {
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

        it('Should collapse the root node', () => {
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });
            navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.navigationNode).true;

            navigationHandler.handleEvent({ key: 'ArrowLeft' });
            const navNodeAfterCollapse = navigationHandler.findNavigationNode();
            expect(navNodeAfterCollapse).exist;
            expect(navNodeAfterCollapse.id).equals('id1');
            expect(navNodeAfterCollapse.navigationNode).true;

            navigationHandler.handleEvent({ key: 'ArrowDown' });
            const newNavigationNode = navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id2');
            expect(newNavigationNode.navigationNode).true;
        });

    });

});