/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { TreeNode, TreeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/tree';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Browser / Components / Tree', () => {

    describe('Plain flat tree.', () => {

        it('Should link siblings correctly.', () => {
            const tree = [
                new TreeNode('id1', 'label1'),
                new TreeNode('id2', 'label2'),
                new TreeNode('id3', 'label3')
            ];

            TreeUtil.linkTreeNodes(tree, null);

            expect(tree[0].parent).not.exist;
            expect(tree[0].previousNode).not.exist;
            expect(tree[0].nextNode).exist;
            expect(tree[0].nextNode.id).equals('id2');

            expect(tree[1].parent).not.exist;
            expect(tree[1].previousNode).exist;
            expect(tree[1].previousNode.id).equals('id1');
            expect(tree[1].nextNode).exist;
            expect(tree[1].nextNode.id).equals('id3');

            expect(tree[2].parent).not.exist;
            expect(tree[2].previousNode).exist;
            expect(tree[2].previousNode.id).equals('id2');
            expect(tree[2].nextNode).not.exist;
        });

        it('Should link siblings correctly with given filter value.', () => {

            const tree = [
                new TreeNode('id1', 'label1'),
                new TreeNode('test1', 'test1'),
                new TreeNode('id2', 'label2'),
                new TreeNode('test2', 'test2'),
                new TreeNode('id3', 'label3'),
                new TreeNode('test3', 'test3')
            ];

            TreeUtil.linkTreeNodes(tree, 'label');

            expect(tree[0].previousNode).not.exist;
            expect(tree[0].nextNode).exist;
            expect(tree[0].nextNode.id).equals('id2');

            expect(tree[2].parent).not.exist;
            expect(tree[2].previousNode).exist;
            expect(tree[2].previousNode.id).equals('id1');
            expect(tree[2].nextNode).exist;
            expect(tree[2].nextNode.id).equals('id3');

            expect(tree[4].parent).not.exist;
            expect(tree[4].previousNode).exist;
            expect(tree[4].previousNode.id).equals('id2');
            expect(tree[4].nextNode).not.exist;

        });

    });

    describe('Simple tree', () => {
        it('Should link children and parents correctly.', () => {
            const tree = [
                new TreeNode('id1', 'label1', null, null, [
                    new TreeNode('sub-id1', 'sub1'),
                    new TreeNode('sub-id2', 'sub2'),
                    new TreeNode('sub-id3', 'sub3')
                ], null, null, null, [], true),
                new TreeNode('id2', 'label2'),
                new TreeNode('id3', 'label3')
            ];

            TreeUtil.linkTreeNodes(tree, null);

            expect(tree[0].previousNode).not.exist;
            expect(tree[0].nextNode).exist;
            expect(tree[0].nextNode.id).equals('sub-id1');
            {
                expect(tree[0].children[0].previousNode).exist;
                expect(tree[0].children[0].previousNode.id).equals('id1');
                expect(tree[0].children[0].nextNode).exist;
                expect(tree[0].children[0].nextNode.id).equals('sub-id2');

                expect(tree[0].children[1].previousNode).exist;
                expect(tree[0].children[1].previousNode.id).equals('sub-id1');
                expect(tree[0].children[1].nextNode).exist;
                expect(tree[0].children[1].nextNode.id).equals('sub-id3');

                expect(tree[0].children[2].previousNode).exist;
                expect(tree[0].children[2].previousNode.id).equals('sub-id2');
                expect(tree[0].children[2].nextNode).exist;
                expect(tree[0].children[2].nextNode.id).equals('id2');
            }

            expect(tree[1].parent).not.exist;
            expect(tree[1].previousNode).exist;
            expect(tree[1].previousNode.id).equals('sub-id3');
            expect(tree[1].nextNode).exist;
            expect(tree[1].nextNode.id).equals('id3');

            expect(tree[2].parent).not.exist;
            expect(tree[2].previousNode).exist;
            expect(tree[2].previousNode.id).equals('id2');
            expect(tree[2].nextNode).not.exist;
        });
    });

    describe('Complexe tree', () => {
        it('Should link (grand)children and (grand)parents correctly.', () => {
            const tree = [
                new TreeNode('Test 1', 'Test 1', null, null, [
                    new TreeNode('Test 1.1', 'Test 1.1', null, null, [
                        new TreeNode('Test 1.1.1', 'Test 1.1.1', null, null, [
                            new TreeNode('Test 1.1.1.1', 'Test 1.1.1.1')
                        ], null, null, null, [], true)
                    ], null, null, null, [], true),
                    new TreeNode('Test 1.2', 'Test 1.2')
                ], null, null, null, [], true)
            ];

            TreeUtil.linkTreeNodes(tree, null);

            expect(tree[0].nextNode).exist;
            expect(tree[0].nextNode.id).equals('Test 1.1');

            const child1 = tree[0].children[0];
            expect(child1.parent).exist;
            expect(child1.parent.id).equals('Test 1');
            expect(child1.nextNode).exist;
            expect(child1.nextNode.id).equals('Test 1.1.1');

            const child2 = child1.children[0];
            expect(child2.parent).exist;
            expect(child2.parent.id).equals('Test 1.1');
            expect(child2.nextNode).exist;
            expect(child2.nextNode.id).equals('Test 1.1.1.1');

            const child3 = child2.children[0];
            expect(child3.parent).exist;
            expect(child3.parent.id).equals('Test 1.1.1');
            expect(child3.nextNode).exist;
            expect(child3.nextNode.id).equals('Test 1.2');

            expect(tree[0].children[1]).exist;
            expect(tree[0].children[1].previousNode).exist;
            expect(tree[0].children[1].previousNode.id).equals('Test 1.1.1.1');

        });

        it('Should link (grand)children and (grand)parents correctly.', () => {
            const tree = [
                new TreeNode('Postmaster', 'Postmaster'),
                new TreeNode('Raw', 'Raw'),
                new TreeNode('Junk', 'Junk'),
                new TreeNode('Misc', 'Misc'),
                new TreeNode('Test 1', 'Test 1', null, null, [
                    new TreeNode('Test 1.1', 'Test 1.1', null, null, [
                        new TreeNode('Test 1.1.1', 'Test 1.1.1', null, null, [
                            new TreeNode('Test 1.1.1.1', 'Test 1.1.1.1')
                        ], null, null, null, [], true)
                    ], null, null, null, [], true),
                    new TreeNode('Test 1.2', 'Test 1.2', null, null, [
                        new TreeNode('Test 1.2.1', 'Test 1.2.1'),
                        new TreeNode('Test 1.2.2', 'Test 1.2.2', null, null, [
                            new TreeNode('Test 1.2.2.1', 'Test 1.2.2.1'),
                            new TreeNode('Test 1.2.2.2', 'Test 1.2.2.2')
                        ], null, null, null, [], true),
                        new TreeNode('Test 1.2.3', 'Test 1.2.3')
                    ], null, null, null, [], true)
                ], null, null, null, [], true)
            ];

            TreeUtil.linkTreeNodes(tree, null);

            let nextNode = tree[0];

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Raw');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Junk');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Misc');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.1');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.1.1');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.1.1.1');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.2');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.2.1');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.2.2');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.2.2.1');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.2.2.2');

            nextNode = nextNode.nextNode;
            expect(nextNode).exist;
            expect(nextNode.id).equals('Test 1.2.3');

            nextNode = nextNode.nextNode;
            expect(nextNode).not.exist;
        });

    });

    describe('Find nodes in tree.', () => {

        const tree = [
            new TreeNode('Postmaster', 'Postmaster'),
            new TreeNode('Raw', 'Raw'),
            new TreeNode('Junk', 'Junk'),
            new TreeNode('Misc', 'Misc'),
            new TreeNode('Test 1', 'Test 1', null, null, [
                new TreeNode('Test 1.1', 'Test 1.1', null, null, [
                    new TreeNode('Test 1.1.1', 'Test 1.1.1', null, null, [
                        new TreeNode('Test 1.1.1.1', 'Test 1.1.1.1')
                    ], null, null, null, [], true)
                ], null, null, null, [], true),
                new TreeNode('Test 1.2', 'Test 1.2', null, null, [
                    new TreeNode('Test 1.2.1', 'Test 1.2.1'),
                    new TreeNode('Test 1.2.2', 'Test 1.2.2', null, null, [
                        new TreeNode('Test 1.2.2.1', 'Test 1.2.2.1'),
                        new TreeNode('Test 1.2.2.2', 'Test 1.2.2.2')
                    ], null, null, null, [], true),
                    new TreeNode('Test 1.2.3', 'Test 1.2.3')
                ], null, null, null, [], true)
            ], null, null, null, [], true)
        ];

        it('Should find the node on first level.', () => {
            const node = TreeUtil.findNode(tree, 'Junk');
            expect(node).exist;
            expect(node.id).equals('Junk');
        });

        it('Should find the node on second level.', () => {
            const node = TreeUtil.findNode(tree, 'Test 1.2');
            expect(node).exist;
            expect(node.id).equals('Test 1.2');
        });

        it('Should find the node on third level.', () => {
            const node = TreeUtil.findNode(tree, 'Test 1.2.2');
            expect(node).exist;
            expect(node.id).equals('Test 1.2.2');
        });

        it('Should find the node on fourth level.', () => {
            const node = TreeUtil.findNode(tree, 'Test 1.2.2.2');
            expect(node).exist;
            expect(node.id).equals('Test 1.2.2.2');
        });

        it('Should not find a node for a invalid id.', () => {
            const node = TreeUtil.findNode(tree, 'invalid');
            expect(node).not.exist;
        });

    });

    describe('Filter subtrees', () => {
        let tree: TreeNode[] = [];

        before(() => {
            tree = [
                new TreeNode('cmdb', 'CMDB', null, null, [
                    new TreeNode('ci-class', 'CI Classes')
                ]),
                new TreeNode('communication', 'Communication', null, null, [
                    new TreeNode('email', 'Email', null, null, [
                        new TreeNode('email-addresses', 'Email Addresses')
                    ])
                ]),
                new TreeNode('internationalisation', 'Internationalisation', null, null, [
                    new TreeNode('translations', 'Translations')
                ]),
                new TreeNode('faq', 'Knowledge Database', null, null, [
                    new TreeNode('faq-categories', 'FAQ Categories')
                ]),
                new TreeNode('ticket', 'Ticket', null, null, [
                    new TreeNode('priorities', 'Priorities'),
                    new TreeNode('queues', 'Queues'),
                    new TreeNode('states', 'States'),
                    new TreeNode('types', 'Types')
                ]),
                new TreeNode('user', 'User Management', null, null, [
                    new TreeNode('agents', 'Agents'),
                    new TreeNode('roles', 'Roles/Permissions')
                ]),
            ];
        })

        describe("Filter for Ticket", () => {
            before(() => {
                TreeUtil.linkTreeNodes(tree, 'Ticket');
            });

            it('The tree should only contain the node Ticket as visible.', () => {
                const visibleNodes = tree.filter((n) => n.visible);
                expect(visibleNodes.length).equals(1);
                expect(visibleNodes[0].id).equals('ticket');
            });

            it('The node ticket should contain 4 visible children', () => {
                const visibleNodes = tree.filter((n) => n.visible);
                expect(visibleNodes[0].children).exist;

                const children = visibleNodes[0].children.filter((n) => n.visible);
                expect(children.length).equals(4);
            });
        });

        describe("Filter for Communication", () => {
            before(() => {
                TreeUtil.linkTreeNodes(tree, 'Communication');
            });

            it('The tree should only contain the node Communication as visible.', () => {
                const visibleNodes = tree.filter((n) => n.visible);
                expect(visibleNodes.length).equals(1);
                expect(visibleNodes[0].label).equals('Communication');
            });

            it('The node Communication should contain 1 visible children Email', () => {
                const visibleNodes = tree.filter((n) => n.visible);
                expect(visibleNodes[0].children).exist;

                const children = visibleNodes[0].children.filter((n) => n.visible);
                expect(children.length).equals(1);

                expect(children[0].label).equals('Email');
            });

            it('The node Email should contain 1 visible children Email Addresses', () => {
                const visibleNodes = tree.filter((n) => n.visible);
                expect(visibleNodes[0].children).exist;

                const children = visibleNodes[0].children.filter((n) => n.visible);
                expect(children.length).equals(1);

                const subChildren = children[0].children.filter((c) => c.visible);
                expect(subChildren.length).equals(1);
                expect(subChildren[0].label).equals('Email Addresses');
            });
        });

    });

});
