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
import { TreeHandler, TreeNode, TreeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/tree';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / TreeHandler - Selection', () => {

    describe('select nodes', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should select the first 3 nodes', () => {
            const node1 = TreeUtil.findNode(treeHandler.getTree(), 'id1');
            const node11 = TreeUtil.findNode(treeHandler.getTree(), 'id11');
            const node12 = TreeUtil.findNode(treeHandler.getTree(), 'id12');

            treeHandler.setSelection([node1, node11, node12], true);

            expect(node1.selected).true;
            expect(node11.selected).true;
            expect(node12.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(3);
        });

        it('Should select one more node', () => {
            const node22 = TreeUtil.findNode(treeHandler.getTree(), 'id22');
            treeHandler.setSelection([node22], !node22.selected);

            expect(node22.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(4);
        });

    });

    describe('keep selected nodes in new tree', () => {
        let treeHandler: TreeHandler;

        before(() => {
            const tree = [
                new TreeNode('id1', 'label1', null, null,
                    [
                        new TreeNode('id11', 'label11', null, null,
                            null, null, null, null, null, undefined,
                            undefined, undefined, undefined, undefined, undefined, undefined, true
                        ),
                        new TreeNode('id12', 'label12')
                    ],
                    null, null, null, null, true,
                    undefined, undefined, undefined, undefined, undefined, undefined, true
                ),
                new TreeNode('id2', 'label2', null, null,
                    [
                        new TreeNode('id21', 'label21'),
                        new TreeNode('id22', 'label22')
                    ],
                    null, null, null, null, true,
                    undefined, undefined, undefined, undefined, undefined, undefined, true
                ),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('3 nodes should be selected.', () => {
            const node1 = TreeUtil.findNode(treeHandler.getTree(), 'id1');
            const node11 = TreeUtil.findNode(treeHandler.getTree(), 'id11');
            const node2 = TreeUtil.findNode(treeHandler.getTree(), 'id2');

            expect(node1.selected).true;
            expect(node11.selected).true;
            expect(node2.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length, 'selectedNodes contains not all selected nodes').equals(3);
        });
    });

    describe('Add free text nodes as selection (multiselect)', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should select an existing node', () => {
            const node22 = TreeUtil.findNode(treeHandler.getTree(), 'id22');
            treeHandler.setSelection([node22], !node22.selected);

            expect(node22.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(1);
        });

        it('Should add a free text node which is not contained in tree', () => {
            const treeNode = new TreeNode('freetext', 'freetext');

            treeHandler.setSelection([treeNode], true);

            expect(treeNode.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(2);
        });

    });

    describe('Add and remove free text nodes from tree (multiselect)', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should select an existing node', () => {
            const node22 = TreeUtil.findNode(treeHandler.getTree(), 'id22');
            treeHandler.setSelection([node22], !node22.selected);

            expect(node22.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(1);
        });

        it('Should add free text nodes which are not contained in tree', () => {
            const treeNode1 = new TreeNode('freetext1', 'freetext1');
            const treeNode2 = new TreeNode('freetext2', 'freetext2');

            treeHandler.setSelection([treeNode1, treeNode2], true);

            expect(treeNode1.selected).true;
            expect(treeNode2.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(3);
        });

        it('Should remove free text node', () => {
            const treeNode1 = new TreeNode('freetext1', 'freetext1');
            treeHandler.setSelection([treeNode1], false);

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(2);
        });

    });

    describe('Add free text node to a tree (singleselect)', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should add a free text node to the tree', () => {
            const treeNode1 = new TreeNode('freetext1', 'freetext1');

            treeHandler.setSelection([treeNode1], true);

            expect(treeNode1.selected).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(1);
        });

        it('Should replace the free text node', () => {
            const treeNode2 = new TreeNode('freetext2', 'freetext2');
            treeHandler.setSelection([treeNode2], false);

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(1);
        });

    });

    describe('select all nodes (without filter)', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should select all nodes', () => {
            treeHandler.selectAll();

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(9);
        });

    });

    describe('select all nodes (with filter)', () => {
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
            treeHandler = new TreeHandler(tree, null, 'label2', true);
        });

        it('Should select all filtered nodes', () => {
            treeHandler.selectAll();

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(3);
        });

    });

    describe('deselect all nodes (without filter)', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should select all filtered nodes', () => {
            treeHandler.selectAll();
            treeHandler.selectNone();

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(0);
        });

    });

    describe('deselect all nodes (without filter)', () => {
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
            treeHandler = new TreeHandler(tree, null, 'label2', true);
        });

        it('Should select all filtered nodes', () => {
            treeHandler.selectAll();
            treeHandler.selectNone();

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(0);
        });

    });

    describe('select/deselect all nodes (with filter)', () => {
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
            treeHandler = new TreeHandler(tree, null, 'label2', true);
        });

        it('Should select all first 3 nodes', () => {
            const node1 = TreeUtil.findNode(treeHandler.getTree(), 'id1');
            const node11 = TreeUtil.findNode(treeHandler.getTree(), 'id11');
            const node12 = TreeUtil.findNode(treeHandler.getTree(), 'id12');

            treeHandler.setSelection([node1, node11, node12], true);

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(3);
        });

        it('Should filter the tree', () => {
            treeHandler.filter('label2')

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(3);
        });

        it('Should select all visible nodes in the tree', () => {
            treeHandler.selectAll();

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(6);
        });

        // FIXME: Solve test
        // it('Should deselect all visible nodes in the tree', () => {
        //     treeHandler.selectNone();

        //     const selectedNodes = treeHandler.getSelectedNodes();
        //     expect(selectedNodes).exist;
        //     expect(selectedNodes).an('array');
        //     expect(selectedNodes.length).equals(3);
        // });

        // FIXME: Solve test
        // it('Should reset the filter', () => {
        //     treeHandler.filter(null);

        //     const selectedNodes = treeHandler.getSelectedNodes();
        //     expect(selectedNodes).exist;
        //     expect(selectedNodes).an('array');
        //     expect(selectedNodes.length).equals(3);
        // });

        it('Deselect all nodes', () => {
            treeHandler.selectNone();

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(0);
        });
    });

    describe('select all nodes with Shift + End', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should navigate to the first node', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'Home' });

            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id1');
            expect(newNavigationNode.navigationNode).true;
        });

        it('Should select all nodes until the end', () => {
            treeHandler.handleKeyEvent({ key: 'End', shiftKey: true });

            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id32');
            expect(newNavigationNode.navigationNode).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(9);

        });

    });

    describe('select all nodes with Shift + Home', () => {
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
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should navigate to the last node', () => {
            treeHandler.navigationHandler.handleEvent({ key: 'End' });

            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id32');
            expect(newNavigationNode.navigationNode).true;
        });

        it('Should select all nodes until the first', () => {
            treeHandler.handleKeyEvent({ key: 'Home', shiftKey: true });

            const newNavigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(newNavigationNode).exist;
            expect(newNavigationNode.id).equals('id1');
            expect(newNavigationNode.navigationNode).true;

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(9);
        });

    });

    describe('select all nodes (collapsed tree)', () => {
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
                ]),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should select all nodes, also nodes in collapsed trees', () => {
            treeHandler.selectAll();

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(9);
        });

    });

    describe('select a node and submit it via enter', () => {
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
                ]),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree);
        });

        it('Should not deselect the selected node if enter is pressed', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
            treeHandler.handleKeyEvent({ key: ' ' });
            treeHandler.handleKeyEvent({ key: 'Enter' });
            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(1);
        });

    });

    describe('Press enter and select the focused node', () => {
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
                ]),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('Should not deselect the selected node if enter is pressed', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown' });
            treeHandler.handleKeyEvent({ key: 'Enter' });

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(1);
        });

    });

    describe('Singleselect with shift should not select a node', () => {
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
                ]),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree, null, null, false);
        });

        it('should navigate to the first node', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(0);

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id1');
            expect(navigationNode.navigationNode).true;
        });

        it('should navigate the second node', () => {
            treeHandler.handleKeyEvent({ key: 'ArrowDown', shiftKey: true });

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(0);

            const navigationNode = treeHandler.navigationHandler.findNavigationNode();
            expect(navigationNode).exist;
            expect(navigationNode.id).equals('id11');
            expect(navigationNode.navigationNode).true;
        });

    });

    describe('Select all nodes with strg+a in multiselect tree', () => {
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
                ]),
                new TreeNode('id3', 'label3', null, null, [
                    new TreeNode('id31', 'label31'),
                    new TreeNode('id32', 'label32')
                ], null, null, null, null, true)
            ];
            treeHandler = new TreeHandler(tree, null, null, true);
        });

        it('should select all node', () => {
            treeHandler.handleKeyEvent({ key: 'a', ctrlKey: true });

            const selectedNodes = treeHandler.getSelectedNodes();
            expect(selectedNodes).exist;
            expect(selectedNodes).an('array');
            expect(selectedNodes.length).equals(9);
        });

    });

});