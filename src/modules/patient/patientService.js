import moment from "moment";

class PatientService {
    static validateQueryParams (query) {
        if (!(query.firstName && query.lastName && query.dateOfBirth && query.phoneNumber && query.organization)) {
            return {
                code: 4001,
                message: "One or more required fields missing. Required fields are: firstName, lastName, dateOfBirth, phoneNumber, organization. Add missing field(s) and try again.",
                type: "Precondition Failed"
            };
        }
        if (!(moment(query.dateOfBirth, 'YYYY-MM-DD', true).isValid())) {
            return {
                code: 4002,
                message: "Date of Birth does not meet requirements. Check inputs and try again.",
                type: "Precondition Failed"
            };
        }
        if (!phoneNumberRegExp.test(query.phoneNumber)) {
            return {
                code: 4003,
                message: "Phone number either does not fit format XXX-XXX-XXXX or contains invalid characters. Check inputs and try again.",
                type: "Precondition Failed"
            };
        }
        if (!ORGANIZATIONS[query.orgsysID]) {
            return {
                code: 4004,
                message: "PATIENT DATA REQUEST: Organization ID not found in database. Find a valid OrgSysID and try again.",
                type: "Bad Request"
            };
        }
        return null;
    }

    static async updatePatientObject(fhirObject) {
    
        const {
            birthDate, 
            gender, 
            id: MRN, 
            name = [], 
            extension = [], 
            telecom = [], 
            address = [], 
            communication = []
        } = fhirObject;
    
        let hfPatientObject = {
            firstName: null,
            lastName: null,
            dateOfBirth: birthDate || null,
            assignedGender: null,
            sexualOrientation: null,
            genderIdentity: gender || null,
            ethnicity: null,
            race: null,
            phoneHome: null,
            phoneMobile: null,
            email: null,
            preferredName: null,
            preferredContactMethod: null,
            address: null,
            city: null,
            state: null,
            zipCode: null,
            primaryLanguage: null,
            secondaryLanguage: null,
            MRN,
            hfPracticeID: null
        }
    
        // Process name
        name.forEach(n => {
            if (n.use === "official") {
                hfPatientObject.firstName = n.given[0];
                hfPatientObject.lastName = n.family;
            } else if (n.use === "nickname") {
                hfPatientObject.preferredName = n.given[0];
            }
        });
    
        // Process extensions
        extension.forEach(ext => {
            const url = ext.url;
            const value = ext.extension[0].valueString;
            if (url.endsWith("us-core-birthsex")) hfPatientObject.assignedGender = value;
            if (url.endsWith("us-core-sexual-orientation")) hfPatientObject.sexualOrientation = value;
            if (url.endsWith("us-core-race")) hfPatientObject.race = value;
            if (url.endsWith("us-core-ethnicity")) hfPatientObject.ethnicity = value;
        });
    
        // Process telecom
        telecom.forEach(t => {
            const value = t.value;
            switch(t.use) {
                case "home":
                    hfPatientObject.phoneHome = value;
                    break;
                case "mobile":
                    hfPatientObject.phoneMobile = value;
                    break;
            }
            if (t.system === "email") hfPatientObject.email = value;
        });
    
        // Process address
        const homeAddress = address.find(a => a.use === "home") || address[0];
        if (homeAddress) {
            hfPatientObject.address = homeAddress.line;
            hfPatientObject.city = homeAddress.city;
            hfPatientObject.state = homeAddress.state;
            hfPatientObject.zipCode = homeAddress.postalCode;
        }
    
        // Process communication
        communication.forEach(comm => {
            const langText = comm.language.text;
            if (comm.preferred) {
                hfPatientObject.primaryLanguage = langText;
            } else {
                hfPatientObject.secondaryLanguage = langText;
            }
        });
    
        return hfPatientObject;
    } 
}

export default PatientService