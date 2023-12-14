var express = require('express');
const { create, findOne, updateOne, deleteOne } = require("../controllers/user");
var router = express.Router();

/* GET users listing. */
router.get('/:id', async function(req, res, next) {
  res.status(200).json({data: await deleteOne({_id:req.params.id})})
});

module.exports = router;
