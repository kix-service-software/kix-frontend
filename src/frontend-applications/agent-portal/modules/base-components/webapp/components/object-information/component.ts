/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';

class Component extends AbstractMarkoComponent<ComponentState> {

    private routingConfigurations: Array<[string, RoutingConfiguration]>;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.properties = [];
        this.state.prepared = false;
        this.state.properties = input.properties;
        this.routingConfigurations = input.routingConfigurations;
        this.state.flat = input.flat;
        this.init(input.object);
    }

    private async init(object: KIXObject): Promise<void> {
        if (object) {
            if (!this.state.properties) {
                this.state.properties = [];
                for (const key in object) {
                    if (object[key] !== undefined) {
                        this.state.properties.push(key);
                    }
                }
            }
        }

        this.state.object = object;

        setTimeout(() => this.state.prepared = true, 20);
    }

    public getRoutingConfiguration(property: string): RoutingConfiguration {
        if (this.routingConfigurations && !!this.routingConfigurations.length) {
            const config = this.routingConfigurations.find((rc) => rc[0] === property);
            return config ? config[1] : undefined;
        }
    }

    public getRoutingObjectId(property: string): string | number {
        const config = this.getRoutingConfiguration(property);
        let id: string | number;
        if (config) {
            if (config.replaceObjectId) {
                id = config.replaceObjectId;
            } else {
                if (this.state.object) {
                    if (config.objectIdProperty.match(/^.+\..+$/)) {
                        const subObjectData = config.objectIdProperty.split('.');
                        id = this.state.object[subObjectData[0]] ?
                            this.state.object[subObjectData[0]][subObjectData[1]]
                            : undefined;
                    } else {
                        id = this.state.object[config.objectIdProperty];
                    }
                }
            }
        }

        return id;
    }
}

module.exports = Component;
