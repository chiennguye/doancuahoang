const swaggerAutogen = require('swagger-autogen')()
require('dotenv').config()

const doc = {
    info: {
      title: 'Bookstore API V2',
      description: 'Bookstore API V2',
    },
    host: process.env.API_URL,
    schemes: ['http', 'https'],

  };
  

const outputFile = './swagger_output.json'
const endpointsFiles = ['./routes/index.js']

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index.js')
  });