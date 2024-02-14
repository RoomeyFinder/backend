const Feedback = require("../models/feedback")



module.exports.createFeedback = async function({ message, email,name}){
  const feedback = await Feedback.create({
    name, email, message,
  })
  await feedback.mailToManagement()
  return feedback
}