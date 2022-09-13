/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { PluginAction } from './PluginAction';
import { PluginReadme } from './PluginReadme';

export class Plugin extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.PLUGIN;

    public BuildDate: string;

    public BuildNumber: string;

    public ClientID: string;

    public Description: string;

    public Product: string;

    public PatchNumber: string;

    public Readme: PluginReadme[];

    public Requires: string;

    public Actions: PluginAction[];

    public ExtendedData: any;

    public Version: string;

    public constructor(plugin?: Plugin) {
        super(plugin);

        if (plugin) {
            this.BuildDate = plugin.BuildDate;
            this.BuildNumber = plugin.BuildNumber;
            this.ObjectId = this.Product;
            this.ClientID = plugin.ClientID;
            this.Description = plugin.Description;
            this.PatchNumber = plugin.PatchNumber;
            this.Readme = plugin.Readme;
            this.Requires = plugin.Requires;
            this.Actions = plugin.Actions;
            this.ExtendedData = plugin.ExtendedData ? plugin.ExtendedData : null;
            this.Version = plugin.Version;
        }
    }

}
