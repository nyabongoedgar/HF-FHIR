/**
 * @author       James Haines-Temons
 * @see          github location url 
 * @version      0.1
 * @lastUpdated  August 9th, 2023
 * @contactEmail james.haines-temons@healthflow.io
 */


import http from "http";
import express from "express";
import axios from "axios";
import oauth from "axios-oauth-client";
import moment from "moment";


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

/**
 * Function will accept a Patient Object that is formatted to HL7 FHIR r4 and r5 standards and reformats them
 * to a simpler and uniform object.
 * 
 * @param {*}           fhirObject <- only acceptable as a Patient FHIR Resource JSON
 * @returns {object}    hfPatientObject <- simplified patient data readable by healthflow frontend
 */
async function updatePatientObject( fhirObject ) {
    
    // initialize return object
    var hfPatientObject = {
        firstName: null , // from name[] use=official
        lastName: null , // from name[] use=official
        dateOfBirth: ( fhirObject.birthDate ? fhirObject.birthDate : null ) , // direct
        assignedGender: null , // from extension[] endsWith(us-core-birthsex)
        sexualOrientation: null , // from extension[] endsWith(us-core-sexual-orientation)
        genderIdentity: ( fhirObject.gender ? fhirObject.gender : null ) , // direct
        ethnicity: null , // from extension[] endsWith(us-core-ethnicity)
        race: null , // from extension[] endsWith(us-core-race)
        phoneHome: null , // from telecom[] use=home
        phoneMobile: null , // from telecom[] use=mobile
        email: null , // from telecom[] system=email
        preferredName: null , // from name[] use=nickname
        preferredContactMethod: null , // from telecom[] rank=(lowest value)
        address: null , // from address[] line use=home
        city: null , // from address[] city use=home
        state:null , // from address[] state use=home
        zipCode: null , // from address[] postalCode use=home
        primaryLanguage: null , // from communication[].language.text if language.preffered == true
        secondaryLanguage: null , // from communication[].language.text if language.preffered != true
        MRN: ( fhirObject.id ? fhirObject.id : null ) , //direct
        hfPracticeID: null // replace after return with req.query.practiceID
    }

    // get data from name array
    for (let i = 0 ; i < fhirObject.name.length ; i++ ) {
        if (fhirObject.name[i].use === "official") {
            hfPatientObject.firstName = fhirObject.name[i].given[0];
            hfPatientObject.lastName =   fhirObject.name[i].family;
        } else if (fhirObject.name[i].use === "nickname") {
            hfPatientObject.preferredName = fhirObject.name[i].given[0];
        }
    }

    // get data from extensions array
    for (let i = 0 ; i < fhirObject.extension.length ; i++ ) {
        let url = fhirObject.extension[i].url; 
        switch (url) {
            case url.endsWith("us-core-birthsex"):
                hfPatientObject.assignedGender = fhirObject.extension[i].extension[0].valueString
                break;
            case url.endsWith("us-core-sexual-orientation"):
                hfPatientObject.sexualOrientation = fhirObject.extension[i].extension[0].valueString
                break;
            case url.endsWith("us-core-race"):
                hfPatientObject.race = fhirObject.extension[i].extension[0].valueString
                break;
            case url.endsWith("us-core-ethnicity"):
                hfPatientObject.ethnicity = fhirObject.extension[i].extension[0].valueString
                break;
        } 
    }

    // get data from telecom array
    for (let i = 0 ; i < fhirObject.telecom.length ; i++ ) {
        if (fhirObject.telecom[i].use === "home") {
            hfPatientObject.phoneHome = fhirObject.telecom[i].value;
        } else if (fhirObject.telecom[i].use === "mobile") {
            hfPatientObject.phoneMobile = fhirObject.telecom[i].value;
        } else if (fhirObject.telecom[i].system === "email") {
            hfPatientObject.email = fhirObject.telecom[i].value;
        } 
    }

    // get data from address array
    for (let i = 0 ; i < fhirObject.address.length ; i++ ) {
        // console.log(fhirObject.address);
        // console.log(fhirObject.address.length);
        if (fhirObject.address[i].use === "home" || fhirObject.address.length === 1) {
            // address needs to have full street address has unknown number of entries
            hfPatientObject.address = fhirObject.address[i].line;
            hfPatientObject.city = fhirObject.address[i].city;
            hfPatientObject.state = fhirObject.address[i].state;
            hfPatientObject.zipCode = fhirObject.address[i].zipCode;
        }
    }

    // get data from communication array
    for (let i = 0 ; i < fhirObject.communication.length ; i++ ) {
        if (fhirObject.communication.length === 1 || fhirObject.communication[i].preferred) {
            hfPatientObject.primaryLanguage = fhirObject.communication[i].language.text;
        } else {
            hfPatientObject.secondaryLanguage = fhirObject.communication[i].language.text;
        }
    }

    return hfPatientObject;

}


/**
 * Main function starts the service.
 */
async function main() {


    const server = http.createServer((req, res) => {
        // Sending the response
        res.write("This is the response from the server")
        res.end();
    })

    server.listen((8080), () => {
        console.log("Server is Running");
    })

    const app = express();
    const port = 3058;

    const phoneNumberRegExp = /^([0-9]{3}-[0-9]{3}-[0-9]{4})$/ ;

    app.use(express.json()); 
    app.use(express.urlencoded({extended : true}));
    app.get('/patient', async (req, res) => {

        let query = req.query;
        let hfResponseObject = null;
        let organization = ORGANIZATIONS[query.orgsysID];

        // validate all necessary elements are present (firstName, lastName, dateOfBirth, phoneNumber, practiceID)
        // case 1 any element is missing
        if (!(query.firstName && query.lastName && query.dateOfBirth && query.phoneNumber && query.organization)) {
            hfResponseObject = {
                error: {
                    code: 4001 ,
                    message: "One or more required fields missing. Required fields are: firstName, lastName, dateOfBirth, phoneNumber, organization. Add missing field(s) and try again." ,
                    type: "Precondition Failed"
                }
            }
            res.statusCode = 400 ;
        // case two date of birth does not meet entry requirements
        } else if ( !(moment(query.dateOfBirth, 'YYYY-MM-DD', true).isValid()) ) {
            hfResponseObject = {
                error: {
                    code: 4002 ,
                    message: "Date of Birth does either contains a value out of range -- month: 01-12 -or- day 01-31, 01-30, 01-28, 01-29 dependant on month and year -- OR does not fit format YYYY-MM-DD. Check inputs and try again." ,
                    type: "Precondition Failed"
                }
            }
            res.statusCode = 400 ;
        // case three phone number does not meet entry requirements    
        } else if ( !phoneNumberRegExp.test(query.phoneNumber) ) {
            hfResponseObject = {
                error: {
                    code: 4003 ,
                    message: "Phone number either does not fit format XXX-XXX-XXXX or contains invalid characters. Check inputs and try again." ,
                    type: "Precondition Failed"
                }
            }
            res.statusCode = 400 ;
        // case three requested organization ID does not exist
        } else if (!organization) {
            hfResponseObject = {
                error: {
                    code: 4004 ,
                    message: "PATIENT DATA REQUEST: Organization ID not found in database. Find a valid OrgSysID and try again." ,
                    type: "Bad Request"
                }
            }
            res.statusCode = 400;
        // case four all entries meet requirements
        } else {

            
            let token = null;

            if (organization.authConfig) {
              let getToken = oauth.client(axios.create(),organization.authConfig);
              let authorization = await getToken().catch(function (error) {
                  console.log(error);
              });

              token = {Authorization: `Bearer ${authorization.access_token}`, accept: "application/fhir+json"}
            }

            let config = {
                method: "GET",
                url: `${organization.baseUrl}given=${query.firstName}&family=${query.lastName}&birthdate=${query.dateOfBirth}&phone=${query.phoneNumber}`,
                headers: token
            }

            var result;
            result = await axios(config).catch(function (error) {
                console.log("Server request failed.");
            });
        
            let patientData = await result.data ? result.data : { entry: [] };
            // console.log(result);

            let entriesLength = patientData.entry ? patientData.entry.length : 0 ;
            // check to ensure information was returned
            if ( entriesLength < 1 ) {
                hfResponseObject = {
                    error: {
                        code: 2001 ,
                        message: "Cannot perform the intended operation because no patients were found." ,
                        type: ""
                    }
                }
                res.statusCode = 200 ;
            // check to ensure only one patient was found    
            } else if ( entriesLength > 1 ) {
                hfResponseObject = {
                    error: {
                        code: 2002 ,
                        message: "Cannot perform the intended operation because too many patients were found, result could expose sensitive information unrelated to the intended patient." ,
                        type: ""
                    }
                }
                res.statusCode = 200 ;
            // exactly one patient matched the search request    
            } else {
                patientData = patientData.entry[0].resource;
                hfResponseObject = {
                    code: 2000 ,
                    body: await updatePatientObject( patientData ) ,
                    type: "Success"
                }
                hfResponseObject.hfPracticeID = query.organization;
                res.statusCode = 200 ;
                
            }
            
        }

        res.send(hfResponseObject);

    });

    app.listen(port, () => console.log(`API server listening on port ${port}`));

}

main();