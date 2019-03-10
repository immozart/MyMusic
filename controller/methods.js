const toCapitalize = (str) => {
  const arr = str.split(' ');
  let finStr = '';
  arr.forEach(item => {
    let word = item[0].toUpperCase() + item.substring(1) + ' ';
    finStr += word
  });
  return finStr.substring(0, str.length)
};

module.exports = toCapitalize;
