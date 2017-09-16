# shopify-to-3dcart [![Node version](https://img.shields.io/badge/node-v8.0.0-blue.svg)](http://nodejs.org/download/) [![Node version](https://img.shields.io/badge/standard-javascript-yellow.svg)](http://nodejs.org/download/)
Easily convert your Shopify Customer data, by providing a `.csv` file, in a 3DCart ready format.

## Shopify vs 3DCart data comparison

| Shopify           | 3DCart                                 | Notes  |
| ----------------- |----------------------------------------|-------:|
| First Name        | billing_firstname & shipping_firstname |   |
| Last Name         | billing_lastname & shipping_lastname  |   |
| Email             | email |   |
| Company           | billing_company & shipping_company |   |
| Address1          | billing_address & shipping_address |   |
| Address2          | billing_address2 & shipping_address2 |   |
| City              | billing_city & shipping_city |   |
| Province          | --- |   |
| Province Code     | billing_state & shipping_state |   |
| Country           | --- |   |
| Country Code      | billing_country & shipping_country |   |
| Zip               | billing_zip & shipping_zip |   |
| Phone             | billing_phone & shipping_phone |   |
| Accepts Marketing | maillist | `yes - no` => `1 - 0` |
| Total Spent       | --- | Merging into **Comments** field |
| Total Orders      | --- | Merging into **Comments** field |
| Tags              | --- |                                 |
| Note              | Comments | Merging here **Total Spent** and **Total Orders** |
| Tax Exempt        | accountno |   | |

As we can see most of the fields from Shopify have a correspondent in the 3DCart field format but to be made. 3DCart has a few specific fields of it own:
* **pass**: 3DCart suggeststo use customer's zip code but it'd be better to use a random generated alphanumerical string to make things more secure. *(required)*
* **discount**: 3DCart allows you to assign all your imported customers to a group, in order to do that we need to specify the id of the group. Read more about how to create a group and retrieve its id [here](https://support.3dcart.com/Knowledgebase/Article/View/396/7/how-do-i-import-customers-via-csv#v7TIP). *(optional)*
* **custenabled**: This value that can be either *0* or *1* denotes whether the customer account is enabled or not. *(required)*

Also, in order to not lose any customer information we are going to merge the **Total Spent** and the **Total Orders** Shopify fields into the **Comments** 3DCart field along with any existing data present in the Shopify **Note** field. The format that we'll use is along the lines of `"Total Spent: X - Total Orders: Y - Notes: Z"` but it can easily be changed if needed.

Finally, the **Tags** field from Shopify will be left out. 3DCart does not provide any real correspondent but 3DCart uses groups that might fit your needs.

## Usage
Just clone the repository, run `yarn install` and then move the `.csv` file [exported](https://help.shopify.com/manual/customers/import-export-customers#export-existing-customers-to-a-csv-file) from Shopify into the project directory.

The script currently supports one file at the time and processes the first `.csv` file found in the directory in alphabetical order. To convert the file just run `yarn convert` and wait until the console logs `Done!`, the converted file will be in the same directory and will be called `3DCart.csv`.

## Sources

- [3DCart Knowledgebase - How do I import Customers via CSV?](https://support.3dcart.com/Knowledgebase/Article/View/396/7/how-do-i-import-customers-via-csv)
- [Shopify Help Center - Importing and exporting customers](https://help.shopify.com/manual/customers/import-export-customers)
