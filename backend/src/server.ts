import http  from 'http'
import https from 'https'
import fs from 'fs'
import { app } from './app'

const onError = (error: {code: any, syscall: any}, port?: number) => {
  if (error.syscall !== 'listen') {
    throw error
  }

  switch (error.code) {
    case 'EACCES':
      console.error(port + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(port + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}
//change21
//change2

if (process.env.ENVIRONMENT === 'production') {
  const httpsPort: number = process.env.HTTPS_PORT ? parseInt(process.env.HTTPS_PORT) : 3000;
  const keyFile = process.env.KEY_FILE
  const certFile = process.env.CERT_FILE
  if (keyFile && certFile) {
    const httpsServer = https.createServer({
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
    }, app);
    httpsServer.on('error', (err: any) => onError(err, httpsPort));
    httpsServer.on('listening', () => console.log('Listening on port ' + httpsPort));
    httpsServer.listen(httpsPort);

    const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3001
    const httpServer = http.createServer((req, res) => {
      res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
      res.end();
    }).listen(httpPort);
  } else {
    console.error('Cert File and Key File not set.')
  }
} else {
  const httpPort = process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 3000
  if (httpPort) {
    const httpServer = http.createServer(app);
    httpServer.on('error', (err: any) => onError(err, httpPort));
    httpServer.on('listening', () => console.log('Listening on port [DEV] ' + httpPort));
    httpServer.listen(httpPort);
  }
}