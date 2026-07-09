import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '@nama/shared';
import { issueCertificate, getMyCertificates } from './certificates.controller.js';

const router = Router();

router.post('/issue', authenticate, authorize(ROLES.STUDENT, ROLES.EMPLOYEE), issueCertificate);
router.get('/me', authenticate, authorize(ROLES.STUDENT, ROLES.EMPLOYEE), getMyCertificates);

export const certificatesRouter: Router = router;
