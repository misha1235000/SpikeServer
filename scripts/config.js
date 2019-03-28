const pathJoin = require('path').join;

const config = {

  // Copy paths before compilation
  copyPath: [
    { src: './src/certs/files' ,dest: './dist/certs' },
  ],

  // OpenSSL and Certificates configurations
  CERTIFICATES_PATH: 'src/certs/files',
  CERTIFICATE_FILE_NAME: 'certificate.pem',
  PRIVATE_KEY_FILE_NAME: 'privatekey.pem',
  PUBLIC_KEY_FILE_NAME: 'publickey.pem',
  get PUBLIC_KEY_PATH() { return pathJoin(this.CERTIFICATES_PATH, this.PUBLIC_KEY_FILE_NAME) },
}

module.exports = config;
