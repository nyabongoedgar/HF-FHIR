
// Lines 9 through 32 are temporary placeholder constants until database has been set up.
const MELD_CONNECT = {
    id: "1",
    authConfig: null,
    baseUrl: "https://gw.interop.community/CHCPilotTest/open/Patient?"
}

const ATHENA_CONNECT = {
    id: "2",
    authConfig: {
        url: "https://api.preview.platform.athenahealth.com/oauth2/v1/token",

        grant_type: 'client_credentials',
        scope: "system/Patient.read",
        client_id: "0oacdow5bs3CMgEIT297",
        client_secret: "9GZYrq_lrQ5YcBSzgIg9kbnTcRvGozEPL-OVHJNC"
    },
    baseUrl: "https://api.preview.platform.athenahealth.com/fhir/r4/Patient?ah-practice=Organization%2Fa-1.Practice-195900&"
    
};

const ORGANIZATIONS = {
    "1": MELD_CONNECT,
    "2": ATHENA_CONNECT
}

export {ATHENA_CONNECT, MELD_CONNECT, ORGANIZATIONS}