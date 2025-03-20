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
import { TreeHandler, TreeNode, TreeNavigationHandler } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/tree';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / TreeHandler', () => {

    describe('select one nodes via keyboard navigation (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);
        });

        it('Should select the node', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');

            treeHandler.handleKeyEvent({ key: 'Enter' });
            expect(navigationNode.selected).true
        });

        it('Should select a second node after navigation', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id22');

            treeHandler.handleKeyEvent({ key: 'Enter' });
            expect(navigationNode.selected).true
        });

        it('Should select a third node after navigation', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowUp' });
            treeHandler.handleKeyEvent({ key: 'ArrowUp' });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');

            treeHandler.handleKeyEvent({ key: 'Enter' });
            expect(navigationNode.selected).true
        });

        it('Should return 3 selected nodes', () => {
            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(3);
        });

    });

    describe('select multiple nodes via shift + cursor (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);
        });

        it('Should select the first node', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(1);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(2);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(3);
        });

    });

    describe('select multiple nodes via shift + PageDown (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
                ], null, null, null, null, true),
                new TreeNode('4', 'label4'),
                new TreeNode('5', 'label5'),
                new TreeNode('6', 'label6'),
                new TreeNode('7', 'label7')
            ];
            treeHandler = new TreeHandler(tree, null);
        });

        it('Should select all nodes', () => {
            treeHandler.handleKeyEvent({ key: 'PageDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('4');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(10);
        });

    });

    describe('select multiple nodes via shift + PageDown twice (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
                ], null, null, null, null, true),
                new TreeNode('4', 'label4'),
                new TreeNode('5', 'label5'),
                new TreeNode('6', 'label6'),
                new TreeNode('7', 'label7'),
                new TreeNode('8', 'label8'),
                new TreeNode('9', 'label9'),
                new TreeNode('10', 'label10'),
                new TreeNode('11', 'label11'),
                new TreeNode('12', 'label12'),
                new TreeNode('13', 'label13'),
                new TreeNode('14', 'label14'),
                new TreeNode('15', 'label15'),
                new TreeNode('16', 'label16')
            ];
            treeHandler = new TreeHandler(tree, null);
        });

        it('Should select the first 10 nodes', () => {
            treeHandler.handleKeyEvent({ key: 'PageDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('4');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(10);
        });

        it('Should select the next 10 nodes', () => {
            treeHandler.handleKeyEvent({ key: 'PageDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('14');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(20);
        });

    });

    describe('select first node via shift + Pos1 (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
                ], null, null, null, null, true),
                new TreeNode('4', 'label4'),
                new TreeNode('5', 'label5'),
                new TreeNode('6', 'label6'),
                new TreeNode('7', 'label7')
            ];

            treeHandler = new TreeHandler(tree, null);
        });

        it('Should select the first node', () => {
            treeHandler.handleKeyEvent({ key: 'Home', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(1);
        });
    });

    describe('select multiple nodes via shift + end (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
                ], null, null, null, null, true),
                new TreeNode('4', 'label4'),
                new TreeNode('5', 'label5'),
                new TreeNode('6', 'label6'),
                new TreeNode('7', 'label7')
            ];

            treeHandler = new TreeHandler(tree, null);
        });

        it('Should select all nodes', () => {
            treeHandler.handleKeyEvent({ key: 'End', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('7');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(13);
        });

    });

    describe('select/deselect multiple nodes via shift + cursor Down and then Up (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);
        });

        it('Should select the first 3 node', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(3);
        });

        it('Should navigate to the previous node and deselect it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.selected).true;

            expect(navigationNode.nextNode.selected).false;

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(2);
        });

        it('Should navigate to the previous node and deselect it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).true;

            expect(navigationNode.nextNode.selected).false;

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(1);
        });

        it('Should navigate to the previous node and deselect it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).false

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(0);
        });

    });

    describe('select/deselect multiple nodes via shift + cursor Down + Up + Down + Up (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);

            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
        });

        it('Should select the first 6 nodes', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id31');
            expect(navigationNode.selected).true;

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(7);
        });

        it('Should deselect 3 previous nodes', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id21');
            expect(navigationNode.selected).true;

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(4);
        });

        it('Should select 4 more nodes', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id32');
            expect(navigationNode.selected).true;

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(8);
        });

    });

    describe('select/deselect multiple nodes via shift + End + Up + Down and deselct all with Pos1 (without filter)', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);

        });

        it('Should select all nodes', () => {
            treeHandler.handleKeyEvent({ key: 'End', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id32');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(9);
        });

        it('Should deselect 5 nodes', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowUp', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(4);
        });

        it('Should select 3 more nodes', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id3');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(7);
        });

        it('Should select 3 more nodes', () => {
            treeHandler.handleKeyEvent({ key: 'Home', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).false

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(0);
        });
    });

    describe('select multiple nodes via shift + cursor with tree expand (without filter)', () => {
        let treeHandler: TreeHandler;
        let navigationHandler = new TreeNavigationHandler();

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);

        });

        it('Should select the first node', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(1);
        });

        it('Should expand the node and select the first child.', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowRight', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(2);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(3);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(4);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id3');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(5);
        });

    });

    describe('select multiple nodes via shift + cursor with tree expand and collapse (without filter)', () => {
        let treeHandler: TreeHandler;
        let navigationHandler = new TreeNavigationHandler();

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);

        });

        it('Should select the first node', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(1);
        });

        it('Should expand the node and select the first child.', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowRight', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(2);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id12');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(3);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowLeft', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(3);
        });

        it('Should navigate to the next node and select it', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id2');
            expect(navigationNode.selected).true

            const nodes = treeHandler.getSelectedNodes();
            expect(nodes).exist;
            expect(nodes).an('array');
            expect(nodes.length).equals(4);
        });

    });

    describe('notify listeners for changes', () => {
        let treeHandler: TreeHandler;
        let navigationHandler = new TreeNavigationHandler();

        before(() => {
            const tree = [
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
            treeHandler = new TreeHandler(tree, null);

        });

        it('Should notify registered listener.', () => {
            treeHandler.registerListener('listenerId', (nodes: TreeNode[]) => {
                expect(nodes).exist;
                expect(nodes.length).equals(1);
                expect(nodes[0].id).equals('id1');

            });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
        });

        it('Should notify registered listener.', () => {
            treeHandler.registerListener('listenerId', (nodes: TreeNode[]) => {
                expect(nodes).exist;
                expect(nodes.length).equals(2);
                expect(nodes[0].id).equals('id1');
                expect(nodes[1].id).equals('id2');
            });
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });
        });
    });

});
