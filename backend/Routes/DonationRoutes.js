const express = require("express");
const router = express.Router();
const DonationController = require("../Controllers/DonationController");

router.get('/', DonationController.listDonations);
router.get('/:id', DonationController.getDonation);
router.post('/', DonationController.createDonation);
router.put('/:id', DonationController.updateDonation);
router.delete('/:id', DonationController.deleteDonation);
router.delete('/', DonationController.clearDonations);

module.exports = router;


