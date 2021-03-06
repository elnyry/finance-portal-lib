const { Headers } = require('node-fetch');
const AbortController = require('abort-controller');
const {
    sendRequest,
    settlementIdFromHubAccounts,
    createHubAccount,
    getDfspAccounts,
    addDfsp,
    addInitialPositionAndLimits,
    depositFunds,
    addCallbackParticipantPut,
    addCallbackParticipantPutError,
    addCallbackParticipantPutBatch,
    addCallbackParticipantPutBatchError,
    addCallbackPartiesGet,
    addCallbackPartiesPut,
    addCallbackPartiesPutError,
    addCallbackQuotes,
    addCallbackTransferPost,
    addCallbackTransferPut,
    addCallbackTransferError,
    setEmailNetDebitCapAdjustment,
    setEmailSettlementTransferPositionChange,
    setEmailNetDebitCapThresholdBreach,
} = require('../../src/onboarding/onboarding');

describe('Onboarding', () => {
    describe('sendRequest', () => {
        it('should correctly format an onboarding request given an args array', () => {
            // Arrange
            const requestUrl = 'local.host';
            const requestData = {
                method: 'POST',
                headers: {},
                body: JSON.stringify({}),
                redirect: 'follow',
            };
            const request = [requestUrl, requestData];
            const expected = [requestUrl, { ...requestData, signal: new AbortController().signal }];
            const timeout = 30000;
            const jestFetch = jest.fn();

            // Act
            sendRequest(request, timeout, jestFetch);

            // Assert
            expect(jestFetch).toBeCalledWith(...expected);
        });
    });

    describe('settlementIdFromHubAccounts', () => {
        it('should return a settlementId given a currency and an array of hub accounts', () => {
            // Arrange
            const currency = 'XOF';
            const hubAccounts = [
                {
                    id: 7,
                    ledgerAccountType: 'POSITION',
                    currency: 'XOF',
                    isActive: 1,
                    value: 277.1234,
                    reservedValue: 0,
                    changedDate: '2020-06-26T04:06:22.000Z',
                },
                {
                    id: 8,
                    ledgerAccountType: 'SETTLEMENT',
                    currency: 'XOF',
                    isActive: 1,
                    value: -818010,
                    reservedValue: 0,
                    changedDate: '2020-06-25T16:42:46.000Z',
                },
            ];
            const expected = 8;

            // Act
            const actual = settlementIdFromHubAccounts(hubAccounts, currency);

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('createHubAccount', () => {
        it('should return args to create an account on the hub', () => {
            // Arrange
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const type = 'HUB_MULTILATERAL_SETTLEMENT';
            const currency = 'XOF';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'HUB_MULTILATERAL_SETTLEMENT',
                currency: 'XOF',
            });
            const expected = [
                'http://localhost/participants/Hub/accounts',
                {
                    method: 'POST',
                    headers,
                    redirect: 'follow',
                    body,
                },
            ];

            // Act
            const actual = createHubAccount({
                type,
                currency,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('getDfspAccounts', () => {
        it('should return args to get a DFSP\'s accounts on the hub', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const expected = [
                'http://localhost/participants/payerfsp/accounts',
                {
                    method: 'GET',
                    headers,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = getDfspAccounts({
                dfspName,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addDfsp', () => {
        it('should return args to add a DFSP to the hub', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCurrency = 'XOF';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                name: 'payerfsp',
                currency: 'XOF',
            });
            const expected = [
                'http://localhost/participants',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addDfsp({
                dfspName,
                dfspCurrency,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addInitialPositionAndLimits', () => {
        it('should return args to add initial position and NDC for a given DFSP', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCurrency = 'XOF';
            const netDebitCap = 10000;
            const initialPosition = 0;
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                currency: 'XOF',
                limit: {
                    type: 'NET_DEBIT_CAP',
                    value: 10000,
                },
                initialPosition: 0,
            });
            const expected = [
                'http://localhost/participants/payerfsp/initialPositionAndLimits',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addInitialPositionAndLimits({
                dfspName,
                dfspCurrency,
                netDebitCap,
                initialPosition,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('depositFunds', () => {
        it('should return args to deposit funds to a DFSP\'s account', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCurrency = 'XOF';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const amount = 1000;
            const transferId = 'dee18631-6c40-438a-bdd0-67bac5e4e1c2';
            const settlementAccountId = 8;
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                transferId: 'dee18631-6c40-438a-bdd0-67bac5e4e1c2',
                externalReference: 'string',
                action: 'recordFundsIn',
                reason: 'string',
                amount: {
                    amount: 1000,
                    currency: 'XOF',
                },
                extensionList: {
                    extension: [{
                        key: 'string',
                        value: 'string',
                    }],
                },
            });
            const expected = [
                'http://localhost/participants/payerfsp/accounts/8',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = depositFunds({
                dfspName,
                dfspCurrency,
                amount,
                transferId,
                settlementAccountId,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackParticipantPut', () => {
        it('should return args to add callback for participant PUT', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT',
                value: 'http://dfsp/participants/{{partyIdType}}/{{partyIdentifier}}',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackParticipantPut({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackParticipantPutError', () => {
        it('should return args to add callback for participant PUT error', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const dfspPartyId = 'i_am_a_msisdn';
            const dfspPartyIdType = 'msisdn';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_PUT_ERROR',
                value: 'http://dfsp/participants/{{partyIdType}}/{{partyIdentifier}}/error',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackParticipantPutError({
                dfspName,
                dfspCallbackUrl,
                dfspPartyId,
                dfspPartyIdType,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackParticipantPutBatch', () => {
        it('should return args to add callback for participant PUT batch', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT',
                value: 'http://dfsp/participants/{{requestId}}',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackParticipantPutBatch({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackParticipantPutBatchError', () => {
        it('should return args to add callback for participant PUT batch error', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_PARTICIPANT_BATCH_PUT_ERROR',
                value: 'http://dfsp/participants/{{requestId}}/error',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackParticipantPutBatchError({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackPartiesGet', () => {
        it('should return args to add callback for parties GET', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_PARTIES_GET',
                value: 'http://dfsp/parties/{{partyIdType}}/{{partyIdentifier}}',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackPartiesGet({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackPartiesPut', () => {
        it('should return args to add callback for parties PUT', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_PARTIES_PUT',
                value: 'http://dfsp/parties/{{partyIdType}}/{{partyIdentifier}}',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackPartiesPut({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackPartiesPutError', () => {
        it('should return args to add callback for parties PUT error', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_PARTIES_PUT_ERROR',
                value: 'http://dfsp/parties/{{partyIdType}}/{{partyIdentifier}}/error',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackPartiesPutError({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackQuotes', () => {
        it('should return args to add callback for quotes', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_QUOTES',
                value: 'http://dfsp',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackQuotes({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackTransferPost', () => {
        it('should return args to add callback for transfer POST', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_TRANSFER_POST',
                value: 'http://dfsp/transfers',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackTransferPost({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackTransferPut', () => {
        it('should return args to add callback for transfer PUT', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_TRANSFER_PUT',
                value: 'http://dfsp/transfers/{{transferId}}',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackTransferPut({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('addCallbackTransferError', () => {
        it('should return args to add callback for transfer error', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const dfspCallbackUrl = 'http://dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'FSPIOP_CALLBACK_URL_TRANSFER_ERROR',
                value: 'http://dfsp/transfers/{{transferId}}/error',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = addCallbackTransferError({
                dfspName,
                dfspCallbackUrl,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('setEmailNetDebitCapAdjustment', () => {
        it('should return args to set email for net debit cap adjustment', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const email = 'manager@dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            headersMap.set('Cache-Control', 'no-cache');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'NET_DEBIT_CAP_ADJUSTMENT_EMAIL',
                value: 'manager@dfsp',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = setEmailNetDebitCapAdjustment({
                dfspName,
                email,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('setEmailSettlementTransferPositionChange', () => {
        it('should return args to set email for settlement transfer position change', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const email = 'manager@dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            headersMap.set('Cache-Control', 'no-cache');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'SETTLEMENT_TRANSFER_POSITION_CHANGE_EMAIL',
                value: 'manager@dfsp',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = setEmailSettlementTransferPositionChange({
                dfspName,
                email,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });

    describe('setEmailNetDebitCapThresholdBreach', () => {
        it('should return args to set email for net debit cap threshold breach', () => {
            // Arrange
            const dfspName = 'payerfsp';
            const email = 'manager@dfsp';
            const authToken = '4324sdfsfsdf2fsdffsdfs3';
            const hostCentralLedger = 'http://localhost';
            const fspiopSource = 'hub_operator';
            const headersMap = new Map();
            headersMap.set('Authorization', 'Bearer 4324sdfsfsdf2fsdffsdfs3');
            headersMap.set('Content-Type', 'application/json');
            headersMap.set('FSPIOP-Source', 'hub_operator');
            headersMap.set('Cache-Control', 'no-cache');
            const headers = new Headers(headersMap);
            const body = JSON.stringify({
                type: 'NET_DEBIT_CAP_THRESHOLD_BREACH_EMAIL',
                value: 'manager@dfsp',
            });
            const expected = [
                'http://localhost/participants/payerfsp/endpoints',
                {
                    method: 'POST',
                    headers,
                    body,
                    redirect: 'follow',
                },
            ];

            // Act
            const actual = setEmailNetDebitCapThresholdBreach({
                dfspName,
                email,
                authToken,
                hostCentralLedger,
                fspiopSource,
            });

            // Assert
            expect(actual).toEqual(expected);
        });
    });
});
