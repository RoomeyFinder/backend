const Interest = require("../models/interest");
const MongooseQueryBuilder = require("@exploitenomah/mongoose-query-builder")

module.exports.createInterest = async function (data = {}) {
  const { sender, doc, type, seen } = data
  let interest = new Interest({
    sender, doc, type, seen
  })
  return await interest.save()
}

module.exports.findManyInterests = async function (query = {}) {
  const interestQuery = new MongooseQueryBuilder(Interest, query)
  return await interestQuery.find()
}

module.exports.findOneInterest = async function (filter = {}) {
  return await Interest.findOne(filter)
}

module.exports.deleteOneInterest = async function (filter = {}) {
  const { id, doc } = filter
  return await Interest.findOneAndDelete({ _id: id, doc: doc })
}