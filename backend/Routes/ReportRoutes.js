const express = require("express");
const router = express.Router();
const ReportController = require("../Controllers/ReportController");

router.get('/', ReportController.listReports);
router.get('/:id', ReportController.getReport);
router.post('/', ReportController.createReport);
router.put('/:id', ReportController.updateReport);
router.delete('/:id', ReportController.deleteReport);
router.delete('/', ReportController.clearReports);

module.exports = router;
