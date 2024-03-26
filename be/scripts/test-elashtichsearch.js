const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://123.31.43.22:9200' })

module.exports = {


  friendlyName: 'Test elashtichsearch',


  description: '',


  fn: async function () {

    sails.log('Running custom shell script... (`sails run test-elashtichsearch`)');

    // await client.index({
    //   index: 'game-of-thrones',
    //   // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    //   body: {
    //     character: 'Ned Stark',
    //     quote: 'Winter is coming.'
    //   }
    // })

    // await client.index({
    //   index: 'game-of-thrones',
    //   // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    //   body: {
    //     character: 'Daenerys Targaryen',
    //     quote: 'I am the blood of the dragon.'
    //   }
    // })

    // await client.index({
    //   index: 'game-of-thrones',
    //   // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    //   body: {
    //     character: 'Tyrion Lannister',
    //     quote: 'A mind needs books like a sword needs a whetstone.'
    //   }
    // })

    // await client.indices.refresh({ index: 'game-of-thrones' })

    // const { body,statusCode,headers,warnings,meta } = await client.search({
    //   index: 'game-of-thrones',
    //   // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
    //   body: {
    //     query: {
    //       match: { quote: 'Winter is coming' }
    //     }
    //   }
    // })

    // console.log({body,statusCode,headers,warnings,meta})
  }


};

