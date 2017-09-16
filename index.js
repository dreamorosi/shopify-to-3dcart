var dir = require('node-dir')
var path = require('path')
var readFile = require('fs-readfile-promise')
var generatePassword = require('password-generator')
var json2csv = require('json2csv')
var crlf = require('crlf-helper')
const writeFile = require('fs-writefile-promise/lib/node7')

const readCsv = async path => {
  try {
    var buffer = await readFile(path)
    processCsv(buffer.toString())
  } catch (err) {
    console.error('Could not read the file', err.message)
  }
}

const processCsv = text => {
  let lines = text.split(/\r?\n|\r/)
  lines.splice(0, 1)
  let fieldGroups = lines.map(line => line.split(','))
  let users = fieldGroups.map(shopifyFields => ({
    'billing_firstname': shopifyFields[0],
    'billing_lastname': shopifyFields[1],
    'billing_address': shopifyFields[4],
    'billing_address2': shopifyFields[5],
    'billing_city': shopifyFields[6],
    'billing_state': shopifyFields[8],
    'billing_zip': shopifyFields[11],
    'billing_country': shopifyFields[10],
    'billing_company': shopifyFields[3],
    'billing_phone': shopifyFields[12],
    'email': shopifyFields[2],
    'shipping_firstname': shopifyFields[0],
    'shipping_lastname': shopifyFields[1],
    'shipping_address': shopifyFields[4],
    'shipping_address2': shopifyFields[5],
    'shipping_city': shopifyFields[6],
    'shipping_state': shopifyFields[8],
    'shipping_zip': shopifyFields[11],
    'shipping_country': shopifyFields[10],
    'shipping_company': shopifyFields[3],
    'shipping_phone': shopifyFields[12],
    'comments': `Total Spent: ${shopifyFields[14]} - Total Orders: ${shopifyFields[15]} - Notes: ${shopifyFields[17]}`.trim(),
    'pass': generatePassword(),
    'discount': '',
    'accountno': shopifyFields[18],
    'maillist': shopifyFields[13] === 'yes' ? 1 : 0,
    'custenabled': 1
  }))

  if (users[users.length - 1].billing_lastname === undefined) {
    users.splice(users.length - 1, 1)
  }
  convertToCsv(users)
}

const convertToCsv = users => {
  const threedcartFields = [
    'billing_firstname',
    'billing_lastname',
    'billing_address',
    'billing_address2',
    'billing_city',
    'billing_state',
    'billing_zip',
    'billing_country',
    'billing_company',
    'billing_phone',
    'email',
    'shipping_firstname',
    'shipping_lastname',
    'shipping_address',
    'shipping_address2',
    'shipping_city',
    'shipping_state',
    'shipping_zip',
    'shipping_country',
    'shipping_company',
    'shipping_phone',
    'comments',
    'pass',
    'discount',
    'accountno',
    'maillist',
    'custenabled'
  ]
  try {
    var csvLF = json2csv({ data: users, fields: threedcartFields, quotes: '' })
    // 3DCart import feature seems to accept CRLF line endings only
    var csvCRLF = crlf.setLineEnding(csvLF, 'CRLF')
    writeCsv(csvCRLF)
  } catch (err) {
    console.error('An error occurred while converting the data ', err)
  }
}

const writeCsv = async csv => {
  try {
    await writeFile(`${__dirname}/3DCart.csv`, csv)
    console.log('Done!')
  } catch (err) {
    console.error('An error occurred while writing the file ', err)
  }
}

(async () => {
  try {
    let files = await dir.promiseFiles(__dirname)
    let csv = files.filter(file => path.extname(file) === '.csv')
    if (csv.length > 0) {
      if (path.basename(csv[0], '.csv') === '3DCart') {
        console.error('3DCart.csv already exists, please remove it and retry')
        return
      }
      readCsv(csv[0])
      return
    }
    console.error('No .csv file found')
  } catch (err) {
    console.error(err)
  }
})()
