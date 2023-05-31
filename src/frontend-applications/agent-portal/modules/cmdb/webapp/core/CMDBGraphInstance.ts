/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CMDBService } from '.';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ObjectIconLoadingOptions } from '../../../../server/model/ObjectIconLoadingOptions';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ComponentContent } from '../../../base-components/webapp/core/ComponentContent';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';
import { OverlayService } from '../../../base-components/webapp/core/OverlayService';
import { OverlayType } from '../../../base-components/webapp/core/OverlayType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { Graph } from '../../../graph/model/Graph';
import { GraphOption } from '../../../graph/model/GraphOption';
import { GraphInstance } from '../../../graph/webapp/core/GraphInstance';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { LinkService } from '../../../links/webapp/core';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { CID3Link } from '../../model/CID3Link';
import { CID3Node } from '../../model/CID3Node';
import { ConfigItem } from '../../model/ConfigItem';
import { ConfigItemProperty } from '../../model/ConfigItemProperty';
import { VersionProperty } from '../../model/VersionProperty';

export class CMDBGraphInstance extends GraphInstance<CID3Node, CID3Link, ConfigItem> {

    private icons: Map<number, ObjectIcon> = new Map();

    public async getGraphOptions(): Promise<GraphOption[]> {
        const options = await super.getGraphOptions();

        const linkTypes = await LinkService.getLinkTypes(KIXObjectType.CONFIG_ITEM);
        const linkTypeNodes: TreeNode[] = [];
        for (const lt of linkTypes) {
            const displayValue = await TranslationService.translate(lt.Name);
            if (!linkTypeNodes.some((n) => n.id === lt.Name)) {
                linkTypeNodes.push(new TreeNode(lt.Name, displayValue));
            }
        }
        options.push(new GraphOption(
            'RelevantLinkTypes', 'Translatable#Link Types', linkTypeNodes
        ));

        const classes = await CMDBService.getInstance().getClasses();
        const classNodes: TreeNode[] = [];
        for (const c of classes) {
            const displayValue = await LabelService.getInstance().getObjectText(c);
            const displayIcon = await LabelService.getInstance().getObjectIcon(c);
            classNodes.push(new TreeNode(c.Name, displayValue, displayIcon));
        }
        options.push(new GraphOption(
            'RelevantClasses', 'Translatable#Classes', classNodes
        ));

        return options;
    }

    protected async createD3Nodes(graph: Graph<ConfigItem>): Promise<CID3Node[]> {
        const d3Nodes: CID3Node[] = [];
        for (const n of graph.Nodes) {
            if (n.Object.CurDeplStateType !== 'postproductive'){
                let bgColor = super.getNodeColor(null);
                switch (n.Object.CurInciState) {
                    case 'Incident':
                        bgColor = '#e31e24';
                        break;
                    case 'Warning':
                        bgColor = '#ef7f1A';
                        break;
                    case 'Operational':
                        bgColor = '#009846';
                        break;
                    default:
                }

                const node = new CID3Node(n.NodeID, n.Object.Name, n.Object.ClassID, bgColor);
                if (!this.icons.has(n.Object.ClassID)) {
                    const loadingOptions = new ObjectIconLoadingOptions(
                        KIXObjectType.GENERAL_CATALOG_ITEM, n.Object.ClassID
                    );
                    const icons = await KIXObjectService.loadObjects<ObjectIcon>(
                        KIXObjectType.OBJECT_ICON, null, null, loadingOptions
                    );
                    if (Array.isArray(icons) && icons.length) {
                        this.icons.set(n.Object.ClassID, icons[0]);
                        node.image = true;
                    }
                } else {
                    node.image = true;
                }
                d3Nodes.push(node);
            }
        }

        return d3Nodes;
    }

    protected async createD3Links(graph: Graph, nodes: CID3Node[]): Promise<CID3Link[]> {
        let links = await super.createD3Links(graph, nodes);

        links = links.map(
            (l) => new CID3Link(l, nodes.find((n) => n.id === l.source), nodes.find((n) => n.id === l.target))
        );

        return links;
    }

    protected async createNode(svg: any): Promise<any> {
        const node = await super.createNode(svg);

        node.append('image')
            .attr('xlink:href', (d: CID3Node) => {
                return 'data:image/svg+xml;base64,' + this.icons.get(d.classId)?.Content;
            })
            .attr('x', '-12px')
            .attr('y', '-12px')
            .attr('width', '24px')
            .attr('height', '24px')
            .style('display', (d: CID3Node) => d.image ? 'block' : 'none');

        return node;
    }

    protected getNodeColor(d: CID3Node): string {
        return d.bgColor;
    }

    protected getLinkColor(d: CID3Link): string {
        return d?.color;
    }

    protected async nodeClicked(node: CID3Node, event: any): Promise<void> {
        const nodeObject: ConfigItem = this.graph.Nodes.find((n) => n.NodeID === node.id)?.Object;

        const loadingOptions = new KIXObjectLoadingOptions(
            [], null, null, [ConfigItemProperty.CURRENT_VERSION, VersionProperty.PREPARED_DATA]
        );
        const cis = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, [nodeObject?.ConfigItemID], loadingOptions
        );

        if (Array.isArray(cis) && cis.length) {
            OverlayService.getInstance().openOverlay(
                OverlayType.INFO, 'this.instanceId', new ComponentContent('config-item-info', { configItem: cis[0] }),
                'Translatable#Asset', 'kix-icon-ci', false,
                [
                    event?.target?.getBoundingClientRect().left + BrowserUtil.getBrowserFontsize() || 0,
                    event?.target?.getBoundingClientRect().top || 0
                ],
                null, false
            );
        }
    }

    protected isRootNode(node: CID3Node): boolean {
        const nodeObject: ConfigItem = this.graph.Nodes.find((n) => n.NodeID === node.id)?.Object;
        return Number(nodeObject?.ConfigItemID) === Number(this.rootObjectId);
    }

}