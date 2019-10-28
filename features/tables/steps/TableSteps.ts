// tslint:disable
import { expect } from 'chai';
import { Given, Then } from 'cucumber';
import { ITable, TableFactoryService, TableHeaderHeight } from '../../../src/core/browser/table';
import { KIXObjectType } from '../../../src/core/model';
import { FAQArticleTableFactory } from '../../../src/core/browser/faq';
import { TicketTableFactory, TicketTypeTableFactory, TicketStateTableFactory, TicketPriorityTableFactory, TicketQueueTableFactory } from '../../../src/core/browser/ticket';
import { ArticleTableFactory } from '../../../src/core/browser/ticket/table/ArticleTableFactory';
import { ContactTableFactory } from '../../../src/core/browser/contact';
import { ConfigItemTableFactory, ConfigItemClassTableFactory } from '../../../src/core/browser/cmdb';
import { RoleTableFactory, UserTableFactory } from '../../../src/core/browser/user';
import { OrganisationTableFactory } from '../../../src/core/browser/organisation';
import { MailAccountTableFactory } from '../../../src/core/browser/mail-account';
import { FAQCategoryTableFactory } from '../../../src/core/browser/faq/admin';
import { TranslationPatternTableFactory } from '../../../src/core/browser/i18n/admin/table';
import { TextModulesTableFactory } from '../../../src/core/browser/text-modules';
import { MailFilterTableFactory, MailFilterMatchTableFactory, MailFilterSetTableFactory } from '../../../src/core/browser/mail-filter';
import { NotificationTableFactory } from '../../../src/core/browser/notification';
import { WebformTableFactory } from '../../../src/core/browser/webform';
import { GeneralCatalogTableFactory } from '../../../src/core/browser/general-catalog';
import { JobTableFactory } from '../../../src/core/browser/job';

let table: ITable;
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

const heights = {
    'l': TableHeaderHeight.LARGE,
    's': TableHeaderHeight.SMALL
};

Given('Tabelle: {string}', async (objectType: KIXObjectType) => {
    table = await TableFactoryService.getInstance().createTable(`test-table-${objectType}`, objectType);
    expect(table).exist;
    await table.initialize();
});

Given('Tabelle - Schmal: {string}', async (objectType: KIXObjectType) => {
    table = await TableFactoryService.getInstance().createTable(`test-table-${objectType}`, objectType, null, null, null, false, false, true);
    expect(table).exist;
    await table.initialize();
});

Then('Selection: {int}', function (selection: Number) {
    expect(table.getTableConfiguration().enableSelection).equals(Boolean(selection));
});

Then('Toggle: {int}', async (toggle: Number) => {
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

Then('DisplayLimit: {int}', async (displayLimit: Number) => {
    expect(table.getTableConfiguration().displayLimit).equals(displayLimit);
});

Then('Die Spalte {string} muss sortierbar sein: {int}', async (columnId: string, sortable: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().sortable).equals(Boolean(sortable));
});

Then('Die Spalte {string} muss filterbar sein: {int}', async (columnId: string, filterable: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().filterable).equals(Boolean(filterable));
});

Then('Die Spalte {string} hat einen diskreten Filter: {int}', async (columnId: string, listFilter: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().hasListFilter).equals(Boolean(listFilter));
});

Then('Die Spalte {string} muss {int} breit sein', async (columnId: string, width: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().size).equals(width);
});

Then('Die Spalte {string} hat eine flexible Breite: {int}', async (columnId: string, flexible: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().resizable).equals(Boolean(flexible));
});

Then('Die Spalte {string} zeigt Text an: {int}', async (columnId: string, showText: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showText).equals(Boolean(showText));
});

Then('Die Spalte {string} zeigt Icon an: {int}', async (columnId: string, showIcon: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showIcon).equals(Boolean(showIcon));
});

Then('Die Spalte {string} ist vom Typ: {string}', async (columnId: string, type: string) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().dataType).equals(type);
});

Then('Die Spalte {string} zeigt Spaltenbezeichnung an: {int}', function (columnId: string, showColumnTitle: Number) {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showColumnTitle).equals(Boolean(showColumnTitle));
});

Then('Die Spalte {string} zeigt Spaltenicon an: {int}', function (columnId: string, showColumnIcon: Number) {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showColumnIcon).equals(Boolean(showColumnIcon));
});
