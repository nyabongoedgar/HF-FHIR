import PatientService from './patientService'
import { ATHENA_CONNECT, MELD_CONNECT, ORGANIZATIONS } from './constants'
import axios from 'axios'
import oauth from 'axios-oauth-client'
import errorHandler from '../../helpers/response/errorHandler'
import responseHandler from '../../helpers/response/responseHandler'

class PatientController {
  static async getPatientInformation (req, res) {
    try {
      const query = req.query
      const errorResponse = PatientService.validateQueryParams(query)
      if (errorResponse) {
        return errorHandler.handleErrorException(
          'AN_ERROR_OCCURRED',
          'An error occurred',
          400
        )
      }
      const organization = ORGANIZATIONS[query.orgsysID]
      let token = null

      if (organization.authConfig) {
        let getToken = oauth.client(axios.create(), organization.authConfig)
        let authorization = await getToken().catch(error => console.log(error))
        token = {
          Authorization: `Bearer ${authorization.access_token}`,
          accept: 'application/fhir+json'
        }
      }

      const config = {
        method: 'GET',
        url: `${organization.baseUrl}given=${query.firstName}&family=${query.lastName}&birthdate=${query.dateOfBirth}&phone=${query.phoneNumber}`,
        headers: token
      }

      const result = await axios(config)
      const patientData = result.data ? result.data : { entry: [] }
      const entriesLength = patientData.entry ? patientData.entry.length : 0

      if (entriesLength < 1) {
        return errorHandler.handleErrorException(
          400,
          'Cannot perform the intended operation because no patients were found.',
          200,
          response
        )
      }

      if (entriesLength > 1) {
        return errorHandler.handleErrorException(
          400,
          'CToo many patients were found.',
          200,
          response
        )
      }
      const updatedPatientData = await PatientService.updatePatientObject(
        patientData.entry[0].resource
      )
      responseHandler(res, 'Patient information retrieved', 200, updatedPatientData )
    } catch (error) {
      errorHandler.handleError(error.message, 500, res)
    }
  }
}

export default PatientController
