/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ConfiguredWidget } from '../../src/frontend-applications/agent-portal/model/configuration/ConfiguredWidget';
import { Context } from '../../src/frontend-applications/agent-portal/model/Context';
import { ContextDescriptor } from '../../src/frontend-applications/agent-portal/model/ContextDescriptor';
import { User } from '../../src/frontend-applications/agent-portal/modules/user/model/User';
import { UserPreference } from '../../src/frontend-applications/agent-portal/modules/user/model/UserPreference';
import { AgentService } from '../../src/frontend-applications/agent-portal/modules/user/webapp/core/AgentService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Context', () => {

    describe('Merge contex and user widgets', () => {

        const contextWidgets: ConfiguredWidget[] = [
            new ConfiguredWidget('test-widget-1', 'test-widget-1'),
            new ConfiguredWidget('test-widget-2', 'test-widget-2'),
            new ConfiguredWidget('test-widget-3', 'test-widget-3'),
            new ConfiguredWidget('test-widget-4', 'test-widget-4'),
            new ConfiguredWidget('test-widget-5', 'test-widget-5')
        ];
        const userWidgets: ConfiguredWidget[] = [
            new ConfiguredWidget('user-widget-1', 'user-widget-1'),
            new ConfiguredWidget('user-widget-2', 'user-widget-2'),
            new ConfiguredWidget('user-widget-3', 'user-widget-3')
        ];
        describe('No user widgets are configured', () => {
            let widgets: ConfiguredWidget[];

            before(() => {
                const context = new TestContext();
                widgets = (context as any).mergeWidgetLists(contextWidgets, []);
            });

            it('Should return widget array', () => {
                expect(widgets).exist;
                expect(widgets).an('array');
            });

            it('Should return the correct count of context widgets', () => {
                expect(widgets.length).equals(contextWidgets.length);
            });

            it('Should contain the context widgets', () => {
                expect(widgets.some((w) => w.instanceId === 'test-widget-1')).true;
                expect(widgets.some((w) => w.instanceId === 'test-widget-2')).true;
                expect(widgets.some((w) => w.instanceId === 'test-widget-3')).true;
                expect(widgets.some((w) => w.instanceId === 'test-widget-4')).true;
                expect(widgets.some((w) => w.instanceId === 'test-widget-5')).true;
            });
        });

        describe('Only user widgets are configured', () => {
            let widgets: ConfiguredWidget[];

            before(() => {
                const context = new TestContext();
                widgets = (context as any).mergeWidgetLists(contextWidgets, userWidgets);
            });

            it('Should return widget array', () => {
                expect(widgets).exist;
                expect(widgets).an('array');
            });

            it('Should return the correct count of user widgets', () => {
                expect(widgets.length).equals(userWidgets.length);
            });

            it('Should not contain any context widgets', () => {
                expect(widgets.some((w) => w.instanceId === 'test-widget-1')).false;
                expect(widgets.some((w) => w.instanceId === 'test-widget-2')).false;
                expect(widgets.some((w) => w.instanceId === 'test-widget-3')).false;
                expect(widgets.some((w) => w.instanceId === 'test-widget-4')).false;
                expect(widgets.some((w) => w.instanceId === 'test-widget-5')).false;
            });

            it('Should contain user widgets', () => {
                expect(widgets.some((w) => w.instanceId === 'user-widget-1')).true;
                expect(widgets.some((w) => w.instanceId === 'user-widget-2')).true;
                expect(widgets.some((w) => w.instanceId === 'user-widget-3')).true;
            });
        });

        describe('User and context widgets are configured', () => {
            let widgets: ConfiguredWidget[];

            before(() => {
                const context = new TestContext();
                widgets = (context as any).mergeWidgetLists(contextWidgets, [...userWidgets, 'test-widget-3', 'test-widget-4']);
            });

            it('Should return widget array', () => {
                expect(widgets).exist;
                expect(widgets).an('array');
            });

            it('Should return the correct count of widgets', () => {
                expect(widgets.length).equals(userWidgets.length + 2);
            });

            it('Should not contain not configured context widgets', () => {
                expect(widgets.some((w) => w.instanceId === 'test-widget-1')).false;
                expect(widgets.some((w) => w.instanceId === 'test-widget-2')).false;
                expect(widgets.some((w) => w.instanceId === 'test-widget-5')).false;
            });

            it('Should contain user and configured context widgets', () => {
                expect(widgets.some((w) => w.instanceId === 'user-widget-1')).true;
                expect(widgets.some((w) => w.instanceId === 'user-widget-2')).true;
                expect(widgets.some((w) => w.instanceId === 'user-widget-3')).true;
                expect(widgets.some((w) => w.instanceId === 'test-widget-3')).true;
                expect(widgets.some((w) => w.instanceId === 'test-widget-4')).true;
            });
        });

    });

    describe('Retrive user widgets from preferences', () => {

        let originalFunction;

        const preferenceValue = {
            "test-context": {
                "content": [
                    {
                        "instanceId": "Junk Zeit1619762001008",
                        "configurationId": null,
                        "configuration": {
                            "id": "1619761991599",
                            "name": "Junk Zeit",
                            "type": "Widget",
                            "widgetId": "table-widget",
                            "title": "Junk Zeit",
                            "actions": [],
                            "subConfigurationDefinition": null,
                            "configuration": {
                                "id": "1619761979059",
                                "name": "Junk Zeit",
                                "type": "TableWidget",
                                "objectType": "Ticket",
                                "tableConfiguration": {
                                    "id": "1619761971642",
                                    "name": "Junk Zeit",
                                    "type": "Table",
                                    "tableColumnConfigurations": [],
                                    "enableSelection": false,
                                    "toggle": false,
                                    "headerHeight": 2.25,
                                    "rowHeight": 1.75,
                                    "emptyResultHint": "Translatable#0 data sets found.",
                                    "fixedFirstColumn": false,
                                    "additionalTableObjectsHandler": [],
                                    "intersection": true,
                                    "searchName": "Junk Zeit"
                                },
                                "showFilter": true,
                                "shortTable": false,
                                "predefinedTableFilters": [],
                                "cache": false,
                                "resetFilterOnReload": true
                            },
                            "minimized": false,
                            "minimizable": true,
                            "icon": "kix-icon-ticket",
                            "contextDependent": false,
                            "contextObjectDependent": false,
                            "formDependent": false,
                            "formDependencyProperties": []
                        },
                        "permissions": [],
                        "size": "large"
                    },
                    "test-widget-1",
                    "test-widget-2",
                    "test-widget-3",
                    "test-widget-4",
                ]
            }
        };

        let widgets: Array<string | ConfiguredWidget>;

        before(async () => {
            originalFunction = AgentService.getInstance().getCurrentUser;

            AgentService.getInstance().getCurrentUser = async (): Promise<User> => {
                const userPreference = new UserPreference();
                userPreference.ID = 'ContextWidgetLists';
                userPreference.Value = JSON.stringify(preferenceValue);

                const user = new User();
                user.Preferences = [userPreference];

                return user;
            };

            const context = new TestContext();
            widgets = await (context as any).getUserWidgetList('content');
        });

        after(() => {
            AgentService.getInstance().getCurrentUser = originalFunction;
        });

        it('Should return a widget list', () => {
            expect(widgets).exist;
            expect(widgets).an('array');
        });

        it('Should contain a widget configuration', () => {
            const configurations = widgets.filter((w) => typeof w !== 'string');
            expect(configurations).exist;
            expect(configurations.length).equals(1);
        });

        it('Should contain 4 instanceIds', () => {
            const instanceIds = widgets.filter((w) => typeof w === 'string');
            expect(instanceIds).exist;
            expect(instanceIds.length).equals(4);
        });

    });

});

class TestContext extends Context {

    public constructor() {
        super(new ContextDescriptor('test-context', null, null, null, null, null, null, null));
    }

}