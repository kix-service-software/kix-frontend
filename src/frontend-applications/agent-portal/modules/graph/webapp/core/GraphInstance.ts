/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../model/IdService';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { Graph } from '../../model/Graph';
import { GraphD3Link } from '../../model/GraphD3Link';
import { GraphD3Node } from '../../model/GraphD3Node';
import { GraphLink } from '../../model/GraphLink';
import { GraphOption } from '../../model/GraphOption';

declare let d3;

export abstract class GraphInstance<N extends GraphD3Node = GraphD3Node, L extends GraphD3Link = GraphD3Link, O = any> {

    public instanceId: string;

    protected nodes: N[];
    protected links: L[];

    protected simulation;

    protected node;
    protected edgepaths;
    protected edgelabels;
    protected resizeListener = null;

    public constructor(public graph: Graph<O>, public rootObjectId: string | number) {
        this.instanceId = IdService.generateDateBasedId();
    }

    public async getGraphOptions(): Promise<GraphOption[]> {
        const depthNodes: TreeNode[] = [];
        for (let i = 1; i < 4; i++) {
            depthNodes.push(new TreeNode(i, i.toString()));
        }
        return [new GraphOption('MaxDepth', 'Translatable#Max Depth', depthNodes, true, false)];
    }

    public async createGraph(containerId: string): Promise<void> {
        this.nodes = await this.createD3Nodes(this.graph);
        this.links = await this.createD3Links(this.graph, this.nodes);

        if (Array.isArray(this.nodes) && Array.isArray(this.links)) {
            const svg = d3.select(containerId)
                .append('svg')
                .attr('viewBox', '0 0 1400 860')
                .call(d3.zoom()
                    .scaleExtent([0.2, 2.5])
                    .on('zoom', (e) => {
                        g.attr('transform', e.transform);
                    })
                );
            const g = svg.append('g').attr('cursor', 'grab');

            const containerElement = document.querySelector(containerId);
            const clientWidth = containerElement.clientWidth;
            const clientHeight = containerElement.clientHeight;
            this.simulation = d3.forceSimulation()
                .force('charge', d3.forceManyBody())
                .force('collision', d3.forceCollide().radius((d) => 80))
                .force('center', d3.forceCenter(clientWidth / 2, clientHeight / 2))
                .force('link', d3.forceLink().id((d) => d.id).distance(200).strength(1));

            await this.resizeCanvas(svg, containerId);
            this.resizeListener = window.addEventListener('resize',
                async () => await this.resizeCanvas(svg, containerId));
            await this.createLink(g);
            this.node = await this.createNode(g);

            this.simulation.nodes(this.nodes).on('tick', this.ticked.bind(this));
            this.simulation.force('link').links(this.links);
        }

    }

    public removeListener(): void {
        this.resizeListener = null;
    }

    private async resizeCanvas(svg: any, containerId: any): Promise<void> {
        const containerElement = document.querySelector(containerId);
        const clientWidth = containerElement.clientWidth;
        const clientHeight = containerElement.clientHeight;
        svg.attr('viewBox', null);
        svg.attr('viewBox', `0 0 ${clientWidth} ${clientHeight}`);
    }

    protected async createD3Nodes(graph: Graph): Promise<N[]> {
        return graph?.Nodes.map((n) => new GraphD3Node(n.NodeID, n.NodeID)) as N[];
    }

    protected async createD3Links(graph: Graph, nodes: N[]): Promise<L[]> {
        const links: GraphD3Link[] = [];
        const graphLinks: GraphLink[] = (graph?.Links as any) as GraphLink[];
        for (const l of graphLinks) {
            const linkTypeLabel = await TranslationService.translate(l.LinkType);
            const graphLink = new GraphD3Link(l.SourceNodeID, l.TargetNodeID, linkTypeLabel);

            if (nodes?.some((n) => n.id === graphLink.source) && nodes?.some((n) => n.id === graphLink.target)) {
                const existingLink = links.find(
                    (l) => l.source === graphLink.target
                        && l.target === graphLink.source
                        && l.linkType === graphLink.linkType
                );
                if (!existingLink) {
                    links.push(graphLink);
                } else {
                    existingLink.bidirectional = true;
                }
            }
        }

        return links as L[];
    }

    protected async createNode(g: any): Promise<any> {
        const node = g.selectAll('.node')
            .data(this.nodes)
            .join('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.simulation?.alphaTarget(0.3).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) this.simulation?.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                })
            )
            .on('click', (event, d) => {
                this.nodeClicked(d, event);
            });

        node.append('rect')
            .attr('width', 35)
            .attr('height', 35)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('x', -17.5)
            .attr('y', -17.5)
            .style('fill', (d) => this.getNodeColor(d) || '#5b5b5b')
            .style('display', (d) => this.isRootNode(d) ? 'none' : 'block');

        node.append('circle')
            .attr('r', 20)
            .style('fill', (d) => this.getNodeColor(d) || '#5b5b5b')
            .style('display', (d) => this.isRootNode(d) ? 'block' : 'none');

        node.append('text')
            .attr('dy', 5)
            .attr('dx', 35)
            .text((d) => this.getNodeText(d) || d.name)
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', (d) => this.getNodeColor(d));
        return node;
    }

    protected async createLink(g: any): Promise<any> {
        const defs = g.append('defs');

        defs.append('marker')
            .attrs({
                'id': 'arrowhead-start',
                'viewBox': '-0 -5 10 10',
                'refX': 25,
                'refY': 0,
                'orient': 'auto-start-reverse',
                'markerWidth': 12,
                'markerHeight': 12,
                'xoverflow': 'visible'
            })
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', (d) => this.getLinkColor(d) || '#5b5b5b');

        defs.append('marker')
            .attrs({
                'id': 'arrowhead-end',
                'viewBox': '-0 -5 10 10',
                'refX': 25,
                'refY': 0,
                'orient': 'auto',
                'markerWidth': 12,
                'markerHeight': 12,
                'xoverflow': 'visible'
            })
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', (d) => this.getLinkColor(d) || '#5b5b5b');

        this.edgepaths = await this.createEdgePaths(g);
        this.edgelabels = await this.createEdgeLabels(g);
    }

    protected async createEdgePaths(g: any): Promise<any> {
        return g.selectAll('.edgepath')
            .data(this.links)
            .join('path')
            .attrs({
                'class': 'edgepath',
                'fill-opacity': 0,
                'stroke-opacity': 1,
                'id': (d, i) => 'edgepath' + i
            })
            .attr('stroke', (d) => this.getLinkColor(d), '#5b5b5b')
            .attr('marker-end', 'url(#arrowhead-end)')
            .attr('marker-start', (d: GraphD3Link) => d.bidirectional ? 'url(#arrowhead-start)' : '')
            .style('pointer-events', 'none');
    }

    protected async createEdgeLabels(g: any): Promise<any> {
        const edgelabels = g.selectAll('.edgelabel')
            .data(this.links)
            .join('text')
            .style('pointer-events', 'none')
            .style('font-size', '12px')
            .attr('fill', (d) => this.getLinkColor(d) || '#5b5b5b')
            .attrs({
                'class': 'edgelabel',
                'id': (d, i) => 'edgelabel' + i,
                'font-size': 10,
                'dy': 12
            });

        edgelabels.append('textPath')
            .attr('xlink:href', (d, i) => '#edgepath' + i)
            .style('text-anchor', 'middle')
            .style('pointer-events', 'none')
            .attr('startOffset', '50%')
            .text((d) => this.getLinkText(d) || d.linkType);

        return edgelabels;
    }

    protected ticked(): void {
        this.node.attr('transform', (d) => 'translate(' + d.x + ',' + d.y + ')');

        this.edgepaths.attr('d', (d) => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            let dr = 0;

            if (d.linknum > 1) {
                dr = Math.sqrt(dx * dx + dy * dy);
                dr = dr / (1 + (1 / d.linknum) * (d.linkindex - 1));
            }
            return 'M' + d.source.x + ',' + d.source.y + 'A' + dr + ',' + dr +
                ' 0 0 1,' + d.target.x + ',' + d.target.y;
        });

        this.edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x && d.linknum <= 1) {
                const bbox = this.getBBox();

                const rx = bbox.x + bbox.width / 2;
                const ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            } else {
                return 'rotate(0)';
            }
        });
    }

    protected isRootNode(d: N): boolean {
        return false;
    }

    protected getNodeText(d: N): string {
        return d.name;
    }

    protected getLinkText(d: L): string {
        return d.linkType;
    }

    protected getNodeColor(d: N): string {
        return '#5b5b5b';
    }

    protected getLinkColor(d: L): string {
        return '#5b5b5b';
    }

    protected nodeClicked(node: GraphD3Node, event: any): void {
        return;
    }
}