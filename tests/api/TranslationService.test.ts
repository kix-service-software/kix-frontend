/* tslint:disable*/
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { ConfigurationService, TranslationService } from '../../src/core/services';
import { KIXObjectType, Translation, TranslationLanguage, TranslationLanguageLoadingOptions, TranslationProperty } from '../../src/core/model';
import { TranslationsResponse } from '../../src/core/api';

chai.use(chaiAsPromised);
const expect = chai.expect;

const resourcePath = '/i18n/translations';

describe('Translation Service', () => {
    let nockScope;
    let apiURL: string;

    const nock = require('nock');

    const translationId1 = 123456;
    const translationId2 = 654321;
    const translationId3 = 6789;
    const translationId4 = 9876;

    before(async () => {
        require('../TestSetup');
        apiURL = ConfigurationService.getInstance().getServerConfiguration().BACKEND_API_URL;

        nockScope = nock(apiURL);

        nockScope
            .get(resourcePath)
            .query({ include: 'Languages' })
            .reply(200, buildTranslationsResponse([translationId1, translationId2, translationId3, translationId4], ['fr', 'en', 'de']));
    });

    it('Service instance exists.', () => {
        expect(TranslationService.getInstance()).exist;
    });

    describe('Create a valid request to retrieve translations.', () => {

        it('Should return a list of translations.', async () => {
            const translations = await TranslationService.getInstance().loadObjects<Translation>('token', KIXObjectType.TRANSLATION, null, null, null);
            expect(translations).exist;
            expect(translations).an('array');
            expect(translations.length).equals(4);
            expect(translations[0].ID).equal(translationId1);
            expect(translations[0]).instanceOf(Translation);
            expect(translations[1].ID).equal(translationId2);
            expect(translations[1]).instanceOf(Translation);
        });

        it('Should return a translation for the given id.', async () => {
            const translations = await TranslationService.getInstance().loadObjects<Translation>('token', KIXObjectType.TRANSLATION, [translationId2], null, null);
            expect(translations).exist;
            expect(translations).an('array');
            expect(translations.length).equals(1);
            expect(translations[0].ID).equal(translationId2);
            expect(translations[0]).instanceOf(Translation);
        });

        it('Should return a list of translation for the given ids.', async () => {
            const translations = await TranslationService.getInstance().loadObjects<Translation>('token', KIXObjectType.TRANSLATION, [translationId3, translationId4], null, null);
            expect(translations).exist;
            expect(translations).an('array');
            expect(translations.length).equals(2);
            expect(translations[0].ID).equal(translationId3);
            expect(translations[0]).instanceOf(Translation);
            expect(translations[1].ID).equal(translationId4);
            expect(translations[1]).instanceOf(Translation);
        });
    });

    describe('Create a valid request to retrieve translations.', () => {

        it('Should return a list of translation languages.', async () => {
            const languages = await TranslationService.getInstance().loadObjects<TranslationLanguage>('token', KIXObjectType.TRANSLATION_LANGUAGE, null, null, new TranslationLanguageLoadingOptions(translationId1));
            expect(languages).exist;
            expect(languages).an('array');
            expect(languages.length).equals(3);

            expect(languages[0]).instanceOf(TranslationLanguage);
            expect(languages[0].TranslationID).equal(translationId1);
            expect(languages[0].Language).equal('de');
            expect(languages[0].Value).exist;

            expect(languages[1]).instanceOf(TranslationLanguage);
            expect(languages[1].TranslationID).equal(translationId1);
            expect(languages[1].Language).equal('en');
            expect(languages[1].Value).exist;

            expect(languages[2]).instanceOf(TranslationLanguage);
            expect(languages[2].TranslationID).equal(translationId1);
            expect(languages[2].Language).equal('fr');
            expect(languages[2].Value).exist;
        });

        it('Should return a translation language for given language id.', async () => {
            const languages = await TranslationService.getInstance().loadObjects<TranslationLanguage>('token', KIXObjectType.TRANSLATION_LANGUAGE, ['de'], null, new TranslationLanguageLoadingOptions(translationId2));
            expect(languages).exist;
            expect(languages).an('array');
            expect(languages.length).equals(1);

            expect(languages[0]).instanceOf(TranslationLanguage);
            expect(languages[0].TranslationID).equal(translationId2);
            expect(languages[0].Language).equal('de');
            expect(languages[0].Value).exist;
        });

        it('Should return a list of translation languages for given language ids.', async () => {
            const languages = await TranslationService.getInstance().loadObjects<TranslationLanguage>('token', KIXObjectType.TRANSLATION_LANGUAGE, ['de', 'fr'], null, new TranslationLanguageLoadingOptions(translationId3));
            expect(languages).exist;
            expect(languages).an('array');
            expect(languages.length).equals(2);

            expect(languages[0]).instanceOf(TranslationLanguage);
            expect(languages[0].TranslationID).equal(translationId3);
            expect(languages[0].Language).equal('de');
            expect(languages[0].Value).exist;

            expect(languages[1]).instanceOf(TranslationLanguage);
            expect(languages[1].TranslationID).equal(translationId3);
            expect(languages[1].Language).equal('fr');
            expect(languages[1].Value).exist;
        });

    });

    describe('Create new translations.', () => {

        before(async () => {
            nockScope
                .post(resourcePath, { Translation: { Pattern: /.+/i } })
                .reply(201, { TranslationID: 24 });
        });

        it('should create a correct request to create a translation.', async () => {
            const parameter: Array<[string, any]> = [
                [TranslationProperty.PATTERN, 'BasePattern']
            ]
            const translationId = await TranslationService.getInstance().createObject('token', KIXObjectType.TRANSLATION, parameter)
            expect(translationId).exist;
            expect(translationId).equals(24);
        });

    });

    describe('Create new translations with languages.', () => {

        before(async () => {
            nockScope
                .post(resourcePath, {
                    Translation: {
                        Pattern: /.+/i,
                        Languages: [{ Language: 'de', Value: 'Das ist ein Test.' }, { Language: 'en', Value: 'This is a test.' }]
                    }
                })
                .reply(201, { TranslationID: 24 });
        });

        it('should create a correct request to create a translation.', async () => {
            const parameter: Array<[string, any]> = [
                [TranslationProperty.PATTERN, 'BasePattern'],
                ['de', 'Das ist ein Test.'],
                ['en', 'This is a test.']
            ]
            const translationId = await TranslationService.getInstance().createObject('token', KIXObjectType.TRANSLATION, parameter)
            expect(translationId).exist;
            expect(translationId).equals(24);
        });

    });

    describe('Create new translations with languages.', () => {

        before(async () => {
            nockScope
                .post(resourcePath, { Translation: { Pattern: /.+/i, Languages: [{ Language: 'en', Value: 'This is a test.' }] } })
                .reply(201, { TranslationID: 24 });
        });

        it('should create a correct request with correct defined languages to create a translation.', async () => {
            const parameter: Array<[string, any]> = [
                [TranslationProperty.PATTERN, 'BasePattern'],
                ['de', null],
                ['fr', undefined],
                ['es', ''],
                ['en', 'This is a test.']
            ]
            const translationId = await TranslationService.getInstance().createObject('token', KIXObjectType.TRANSLATION, parameter)
            expect(translationId).exist;
            expect(translationId).equals(24);
        });

    });

    describe('Update existing translation pattern.', () => {

        const translationId = 24;

        before(async () => {
            nockScope
                .patch(resourcePath + '/' + translationId, { Translation: { Pattern: 'new-pattern' } })
                .reply(200, { TranslationID: translationId });
        });

        it('should create a correct request to update a translation pattern.', async () => {
            const parameter: Array<[string, any]> = [
                [TranslationProperty.PATTERN, 'new-pattern']
            ]
            const resultId = await TranslationService.getInstance().updateObject(
                'token', KIXObjectType.TRANSLATION, parameter, translationId
            )
            expect(resultId).exist;
            expect(resultId).equals(24);
        });

    });

    describe('Update existing translation pattern and a existing language.', () => {

        const translationId = 24;
        const languageId = 'de';

        before(async () => {
            nockScope
                .patch(resourcePath + '/' + translationId, { Translation: { Pattern: 'new-pattern' } })
                .reply(200, { TranslationID: translationId });

            nockScope
                .patch(resourcePath + '/' + translationId + '/' + languageId, { TranslationLanguage: { Value: 'new-value' } })
                .reply(200, { TranslationID: translationId });
        });

        it('should create a correct request to update a translation pattern.', async () => {
            const parameter: Array<[string, any]> = [
                [TranslationProperty.PATTERN, 'new-pattern'],
                ['de', 'new-value']
            ]
            const resultId = await TranslationService.getInstance().updateObject(
                'token', KIXObjectType.TRANSLATION, parameter, translationId
            )
            expect(resultId).exist;
            expect(resultId).equals(24);
        });

    });


});

function buildTranslationsResponse(ids: number[], languages: string[]): TranslationsResponse {
    const response = new TranslationsResponse();
    response.Translation = [];
    ids.forEach((id) => {
        const translation = new Translation();
        translation.ID = id;
        translation.Languages = [];
        languages.forEach((l) => {
            const language = new TranslationLanguage();
            language.TranslationID = id;
            language.Language = l;
            language.Value = Math.random().toString();
            translation.Languages.push(language);
        });
        response.Translation.push(translation);
    })
    return response;
}
