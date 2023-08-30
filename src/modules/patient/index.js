import {ATHENA_CONNECT, MELD_CONNECT, ORGANIZATIONS} from "./constants"
import PatientController from "./patientController";
import express from "express"

const Router = express.Router()

Router.get('/patients', PatientController.getPatientInformation)

export default Router
