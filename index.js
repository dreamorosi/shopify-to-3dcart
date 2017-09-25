var dir = require('node-dir')
var path = require('path')
var readFile = require('fs-readfile-promise')
var generatePassword = require('password-generator')
var json2csv = require('json2csv')
var crlf = require('crlf-helper')
const writeFile = require('fs-writefile-promise/lib/node7')
var csvrow = require('csvrow')

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
  let fieldGroups = lines.map(line => csvrow.parse(line))
  let users = fieldGroups.map(shopifyFields => {
    let firstName = shopifyFields[0] !== undefined && shopifyFields[0] !== ''
      ? shopifyFields[0].replace(/,/g, '') : ''
    let lastName = shopifyFields[1] !== undefined && shopifyFields[1] !== ''
      ? shopifyFields[1].replace(/,/g, '') : ''
    let phone = shopifyFields[12] !== undefined
      ? shopifyFields[12].replace('\'', '') : ''
    let notes = shopifyFields[16] !== undefined && shopifyFields[16] !== ''
      ? `- Notes: ${shopifyFields[16].replace(',', '-')}` : ''
    let address = shopifyFields[4] !== undefined && shopifyFields[4] !== ''
      ? shopifyFields[4].replace(/,/g, '') : ''
    let address2 = shopifyFields[5] !== undefined && shopifyFields[5] !== ''
      ? shopifyFields[5].replace(/,/g, '') : ''
    let company = shopifyFields[3] !== undefined && shopifyFields[3] !== ''
      ? shopifyFields[3].replace(/,/g, '') : ''
    let city = shopifyFields[6] !== undefined && shopifyFields[6] !== ''
      ? shopifyFields[6].replace(/,/g, '') : ''
    let state = shopifyFields[8] !== undefined && shopifyFields[8] !== ''
      ? shopifyFields[8].replace(/,/g, '') : ''
    let country = shopifyFields[10] !== undefined && shopifyFields[10] !== ''
      ? shopifyFields[10].replace(/,/g, '') : ''
    let tax = shopifyFields[18] === 'no' || shopifyFields[10] === ''
      ? '' : shopifyFields[18]
    // TODO: validate fields
    return {
      'billing_firstname': firstName,
      'billing_lastname': lastName,
      'billing_address': address,
      'billing_address2': address2,
      'billing_city': city,
      'billing_state': state,
      'billing_zip': shopifyFields[11],
      'billing_country': country,
      'billing_company': company,
      'billing_phone': phone,
      'email': shopifyFields[2],
      'shipping_firstname': firstName,
      'shipping_lastname': lastName,
      'shipping_address': address,
      'shipping_address2': address2,
      'shipping_city': city,
      'shipping_state': state,
      'shipping_zip': shopifyFields[11],
      'shipping_country': country,
      'shipping_company': company,
      'shipping_phone': phone,
      'comments': `Total Spent: ${shopifyFields[14]} - Total Orders: ${shopifyFields[15]} ${notes}`.trim(),
      'pass': generatePassword(),
      'discount': '',
      'accountno': tax,
      // 'maillist': shopifyFields[13] === 'yes' ? 1 : 0,
      'maillist': 1,
      'custenabled': 1
    }
  })

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
