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

describe('Browser / Components / Tree - Keyboard Navigation - Arrow Left/Right', () => {

    describe('tree - collapsed - expand a root node (ArrowRight) (without filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

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
            treeHandler = new TreeHandler(tree);
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
        });

        it('Should expand the node and navigate to first child', () => {
            const node = treeHandler.navigationHandler.findNavigationNode();
            expect(node).exist;
            expect(node.id).equals('id1');

            treeHandler.navigationHandler.handleEvent({ key: 'ArrowRight' });

            expect(node.expanded).true;

            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id11');
        });
    });

    describe('tree - collapsed - expand a root node (ArrowRight) (with filter)', () => {
        let tree;
        let treeHandler: TreeHandler;

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
            treeHandler = new TreeHandler(tree, null, 'label2');
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
        });

        it('Should expand the node and navigate to first visible child', () => {
            const node = treeHandler.navigationHandler.findNavigationNode();
            expect(node).exist;
            expect(node.id).equals('id2');

            treeHandler.navigationHandler.handleEvent({ key: 'ArrowRight' }, 'label22');

            expect(node.expanded).true;

            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id22');
        });
    });

    describe('tree - full expanded - collapse root node (ArrowLeft)', () => {
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

        it('Should collapse the root node', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.navigationNode).true;

            treeHandler.navigationHandler.handleEvent({ key: 'ArrowLeft' });
            expect(navigationNode.expanded).false;

            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id3');
            expect(newNavigationNode.navigationNode).true;
        });

    });

    describe('tree - full expanded - collapse tree if child is focused (ArrowLeft)', () => {
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

        it('Should collapse the root node', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.navigationNode).true;

            treeHandler.navigationHandler.handleEvent({ key: 'ArrowLeft' });
            const navNodeAfterCollapse = treeHandler.navigationHandler.findNavigationNode();
            expect(navNodeAfterCollapse).exist;
            expect(navNodeAfterCollapse.id).equals('id1');
            expect(navNodeAfterCollapse.navigationNode).true;

            treeHandler.navigationHandler.handleEvent({ key: 'ArrowDown' });
            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id2');
            expect(newNavigationNode.navigationNode).true;
        });

    });

});