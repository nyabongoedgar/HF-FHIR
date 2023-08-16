# healthflow-connection-layer-development
Connection interface between Healthflow app and EHR services

## PatientData Microservice Test Folder.

To launch and test this microservice from a local device use docker to build from the Dockerfile and then run. Postman collection will be added soon. Any secrets or urls listed in the code only expose points that are easy to acquire in the public domain and are not considered secure.

Preferably, this same service is available for testing on an AWS server and the target URL can be reached at:
http://connection-layer-dev.apps.connector-dev.oj2i.p1.openshiftapps.com/patient

Two test queries are available and will produce results at this time:

<url>?firstName=tracey&lastName=lebsack&dateOfBirth=1969-12-17&phoneNumber=555-954-1273&organization=2
-- AND --
<url>?firstName=gaynell&lastName=abshire&dateOfBirth=1981-12-21&phoneNumber=555-990-5418&organization=1

Future requests or requests for known valid patients must include the following elements:

firstName: String
lastName: String
dateOfBirth: String -- required format == YYYY-MM-DD
phoneNumber: String -- required format == XXX-XXX-XXXX
organization: String -- AlphaNumeric Value; non-matching values will result in 400 status code Bad Request.
