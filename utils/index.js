module.exports.formatLocation = function (lng, lat) {
  return {
    type: "Point",
    coordinates: [Number(lng), Number(lat)],
  }
}

module.exports.concatToArrayUntilMax = function (max, oldArray, arrayToConcat) {
  let concatenated = [...oldArray]
  if (Array.isArray(concatenated) && arrayToConcat.length > 0) {
    let itemsCount = concatenated.length
    if (itemsCount <= max - 1) {
      let maxAppendable = max - itemsCount
      maxAppendable =
        arrayToConcat.length <= maxAppendable
          ? arrayToConcat.length
          : maxAppendable
      let idxOfItemToAppend = 0
      while (maxAppendable > 0) {
        concatenated = [...concatenated, arrayToConcat[idxOfItemToAppend]]
        idxOfItemToAppend++
        maxAppendable--
      }
    }
  }
  return concatenated
}

module.exports.generateRandomSixDigitToken = function () {
  return Math.floor(100000 + Math.random() * 900000)
}

module.exports.capitalizeFirstLetter = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
