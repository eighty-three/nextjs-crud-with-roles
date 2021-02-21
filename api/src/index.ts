import fs from 'fs';
import http from 'http';
import https from 'https';
import config from './utils/config';
import logger from './utils/logger';
import app from './app';

if (config.NODE_ENV === 'production') {
  const options = {
    key: fs.readFileSync('misc/privkey.pem'),
    cert: fs.readFileSync('misc/cert.pem')
  };

  https.createServer(options, app).listen(config.PORT, () => {
    logger.info(`https server listening on PORT ${config.PORT}`);
  });
} else {
  http.createServer(app).listen(config.PORT, () => {
    logger.info(`http server listening on PORT ${config.PORT}`);
  });
}
