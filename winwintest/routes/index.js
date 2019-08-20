const express = require('express');
const router = express.Router();
const Amo = require('../modules/amo');
const amo = new Amo('shmelevivan21@yandex.ru', '64661c5ae1a6cc384684227c553da0e6a97bdefb', 'shmelevivan21');

router.post('/unsorted_deals_assignment', async (req, res) => {
  try {
    await amo.auth();

    const response = req.body;
    const deal = {};

    for (let key in response) {
      index = key.split('[').join('-').split(']').join('').split('-').pop();
      deal[index] = response[key];
    }

    await amo.setManager(deal);

    res.send(JSON.stringify(deal));
  } catch (err) {
    throw err;
  }

});


module.exports = router;