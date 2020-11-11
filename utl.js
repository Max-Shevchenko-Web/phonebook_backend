// eslint-disable-next-line arrow-body-style
const isContains = (arr, keyWord, item) => {
  return arr.some((a) => a[keyWord] === item)
}

module.exports = isContains
