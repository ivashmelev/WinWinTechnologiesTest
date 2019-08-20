const express = require('express');
const router = express.Router();
const Amo = require('../modules/amo');
const amo = new Amo();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/add_deal', async (req, res) => {
  try {
    await amo.auth();
    await amo.getManagers();
    await amo.getLeads();
    const response = req.body;
    const deal = {};
    for (let key in response) {
      index = key.split('[').join('-').split(']').join('').split('-').pop();
      deal[index] = response[key];
    }
    res.send(JSON.stringify(deal));
  } catch (err) {
    throw err;
  }

});


module.exports = router;