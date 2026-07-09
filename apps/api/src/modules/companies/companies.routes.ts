import { Router } from 'express';
import { companiesController } from './companies.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export const companiesRouter: Router = Router();

// Protect all company routes
companiesRouter.use(authenticate);
companiesRouter.use(authorize('COMPANY_ADMIN'));

companiesRouter.get('/dashboard', companiesController.getDashboard);
companiesRouter.get('/employees', companiesController.getEmployees);
companiesRouter.get('/licenses', companiesController.getLicenses);
companiesRouter.post('/employees/invite', companiesController.inviteEmployee);
companiesRouter.delete('/employees/:employeeId', companiesController.deleteEmployee);
