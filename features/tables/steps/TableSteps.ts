// tslint:disable
import { expect } from 'chai';
import { Given, Then } from 'cucumber';
import { FAQArticleTableFactory, FAQCategoryTableFactory } from '../../../src/frontend-applications/agent-portal/modules/faq/webapp/core';
import { TicketTableFactory, TicketTypeTableFactory, TicketStateTableFactory, TicketPriorityTableFactory, TicketQueueTableFactory } from '../../../src/frontend-applications/agent-portal/modules/ticket/webapp/core';
import { ArticleTableFactory } from '../../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/table/ArticleTableFactory';
import { OrganisationTableFactory } from '../../../src/frontend-applications/agent-portal/modules/customer/webapp/core/table/OrganisationTableFactory';
import { ContactTableFactory } from '../../../src/frontend-applications/agent-portal/modules/customer/webapp/core';
import { ConfigItemTableFactory, ConfigItemClassTableFactory } from '../../../src/frontend-applications/agent-portal/modules/cmdb/webapp/core';
import { MailAccountTableFactory } from '../../../src/frontend-applications/agent-portal/modules/mail-account/webapp/core';
import { TranslationPatternTableFactory } from '../../../src/frontend-applications/agent-portal/modules/translation/webapp/core/admin/table';
import { TextModulesTableFactory } from '../../../src/frontend-applications/agent-portal/modules/textmodule/webapp/core';
import { MailFilterTableFactory, MailFilterMatchTableFactory, MailFilterSetTableFactory } from '../../../src/frontend-applications/agent-portal/modules/mail-filter/webapp/core';
import { NotificationTableFactory } from '../../../src/frontend-applications/agent-portal/modules/notification/webapp/core';
import { WebformTableFactory } from '../../../src/frontend-applications/agent-portal/modules/webform/webapp/core';
import { GeneralCatalogTableFactory } from '../../../src/frontend-applications/agent-portal/modules/general-catalog/webapp/core';
import { JobTableFactory } from '../../../src/frontend-applications/agent-portal/modules/job/webapp/core';
import { MacroActionTableFactory } from '../../../src/frontend-applications/agent-portal/modules/job/webapp/core/table/MacroActionTableFactory';
import { TableHeaderHeight } from '../../../src/frontend-applications/agent-portal/model/configuration/TableHeaderHeight';
import { KIXObjectType } from '../../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { ImportExportTemplateTableFactory, ImportExportTemplateRunTableFactory } from '../../../src/frontend-applications/agent-portal/modules/import-export/webapp/core';
import { RoleTableFactory, UserTableFactory } from '../../../src/frontend-applications/agent-portal/modules/user/webapp/core/admin/table';
import { Table } from '../../../src/frontend-applications/agent-portal/modules/table/model/Table';
import { TableFactoryService } from '../../../src/frontend-applications/agent-portal/modules/table/webapp/core/factory/TableFactoryService';

let table: Table;
TableFactoryService.getInstance().registerFactory(new FAQArticleTableFactory());
TableFactoryService.getInstance().registerFactory(new TicketTableFactory());
TableFactoryService.getInstance().registerFactory(new ArticleTableFactory());
TableFactoryService.getInstance().registerFactory(new OrganisationTableFactory());
TableFactoryService.getInstance().registerFactory(new ContactTableFactory());
TableFactoryService.getInstance().registerFactory(new ConfigItemTableFactory());
TableFactoryService.getInstance().registerFactory(new RoleTableFactory());
TableFactoryService.getInstance().registerFactory(new UserTableFactory());
TableFactoryService.getInstance().registerFactory(new MailAccountTableFactory());
TableFactoryService.getInstance().registerFactory(new TicketTypeTableFactory());
TableFactoryService.getInstance().registerFactory(new TicketStateTableFactory());
TableFactoryService.getInstance().registerFactory(new TicketPriorityTableFactory());
TableFactoryService.getInstance().registerFactory(new FAQCategoryTableFactory());
TableFactoryService.getInstance().registerFactory(new TicketQueueTableFactory());
TableFactoryService.getInstance().registerFactory(new TranslationPatternTableFactory());
TableFactoryService.getInstance().registerFactory(new ConfigItemClassTableFactory());
TableFactoryService.getInstance().registerFactory(new TextModulesTableFactory());
TableFactoryService.getInstance().registerFactory(new MailFilterTableFactory());
TableFactoryService.getInstance().registerFactory(new NotificationTableFactory());
TableFactoryService.getInstance().registerFactory(new MailFilterMatchTableFactory());
TableFactoryService.getInstance().registerFactory(new MailFilterSetTableFactory());
TableFactoryService.getInstance().registerFactory(new WebformTableFactory());
TableFactoryService.getInstance().registerFactory(new GeneralCatalogTableFactory());
TableFactoryService.getInstance().registerFactory(new JobTableFactory());
TableFactoryService.getInstance().registerFactory(new MacroActionTableFactory());
TableFactoryService.getInstance().registerFactory(new ImportExportTemplateTableFactory());
TableFactoryService.getInstance().registerFactory(new ImportExportTemplateRunTableFactory());

const heights = {
    'l': TableHeaderHeight.LARGE,
    's': TableHeaderHeight.SMALL
};

Given('Tabelle: {string}', async (objectType: KIXObjectType | string) => {
    table = await TableFactoryService.getInstance().createTable(`test-table-${objectType}`, objectType);
    expect(table).exist;

    // to enable column checks for dynamic field properties
    table['checkDF'] = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            resolve(true);
            reject();
        });
    };

    await table.initialize();
});

Given('Tabelle - Schmal: {string}', async (objectType: KIXObjectType | string) => {
    table = await TableFactoryService.getInstance().createTable(`test-table-${objectType}`, objectType, null, null, null, false, false, true);
    expect(table).exist;

    // to enable column checks for dynamic field properties
    table['checkDF'] = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            resolve(true);
            reject();
        });
    };

    await table.initialize();
});

Then('Selection: {int}', function (selection: number) {
    expect(table.getTableConfiguration().enableSelection).equals(Boolean(selection));
});

Then('Toggle: {int}', async (toggle: number) => {
    expect(table.getTableConfiguration().toggle).equals(Boolean(toggle));
});

Then('Kopfzeilengröße: {string}', async (type: string) => {
    if (type && heights[type.toLowerCase()]) {
        expect(table.getTableConfiguration().headerHeight).equals(heights[type.toLowerCase()]);
    } else {
        expect(true, `Unknown type given (${type})`).is.false;
    }
});

Then('Zeilengröße: {string}', async (type: string) => {
    if (type && heights[type.toLowerCase()]) {
        expect(table.getTableConfiguration().rowHeight).equals(heights[type.toLowerCase()]);
    } else {
        expect(true, `Unknown type given (${type})`).is.false;
    }
});

Then('DisplayLimit: {int}', async (displayLimit: number) => {
    expect(table.getTableConfiguration().displayLimit).equals(displayLimit);
});

Then('Die Spalte {string} muss sortierbar sein: {int}', async (columnId: string, sortable: number) => {
    const column = table.getColumn(columnId);
    expect(column, `existing columns: ${table['columns'].map((c) => c.getColumnId())}`).exist;
    expect(column.getColumnConfiguration().sortable).equals(Boolean(sortable));
});

Then('Die Spalte {string} muss filterbar sein: {int}', async (columnId: string, filterable: number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().filterable).equals(Boolean(filterable));
});

Then('Die Spalte {string} hat einen diskreten Filter: {int}', async (columnId: string, listFilter: number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().hasListFilter).equals(Boolean(listFilter));
});

Then('Die Spalte {string} muss {int} breit sein', async (columnId: string, width: number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().size).equals(width);
});

Then('Die Spalte {string} hat eine flexible Breite: {int}', async (columnId: string, flexible: number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().resizable).equals(Boolean(flexible));
});

Then('Die Spalte {string} zeigt Text an: {int}', async (columnId: string, showText: number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showText).equals(Boolean(showText));
});

Then('Die Spalte {string} zeigt Icon an: {int}', async (columnId: string, showIcon: number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showIcon).equals(Boolean(showIcon));
});

Then('Die Spalte {string} ist vom Typ: {string}', async (columnId: string, type: string) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().dataType).equals(type);
});

Then('Die Spalte {string} zeigt Spaltenbezeichnung an: {int}', function (columnId: string, showColumnTitle: number) {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showColumnTitle).equals(Boolean(showColumnTitle));
});

Then('Die Spalte {string} zeigt Spaltenicon an: {int}', function (columnId: string, showColumnIcon: number) {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showColumnIcon).equals(Boolean(showColumnIcon));
});
