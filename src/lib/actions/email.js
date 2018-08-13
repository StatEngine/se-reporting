import path from 'path';
import _ from 'lodash';
import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';

import EmailTemplate from 'email-templates';
import uuidv4 from 'uuid/v4';

import { logger } from '../../config/logger';
import Action from './action';
import config from '../../config/';

class Email extends Action {
  constructor(fireDepartment, options) {
    super(fireDepartment, options);

    this.fireDepartment = fireDepartment;

    const transport = nodemailer.createTransport(
      config.email.mandrill ? mandrillTransport(config.email.mandrill) : config.smtp);

    // merge with defaults
    this.options = _.assign({
      transport,
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '../../../emails/assets'),
        },
      },
      views: {
        options: {
          extension: 'ejs',
        },
      },
    }, options);

    if (process.env === 'production') {
      this.options.send = true;
    }
  }

  notify(payload) {
    logger.info('Email notify()');

    const util = require('util')

    console.log(util.inspect(payload, {showHidden: false, depth: null}))

    if (payload.result.locations && payload.result.locations.hits) {
      let geomFeatureArray = '';
      const mapIcon = 'fire-station';

      payload.result.locations.hits.hits.forEach((value, key) => {
        // limit is 100
        if (key < 100) {
          geomFeatureArray = `${geomFeatureArray}pin-s-${mapIcon}+00A9DA(${value._source.address.longitude},${value._source.address.latitude}),`;
        }
      });

      this.options.locals.geojson = geomFeatureArray.slice(0, -1);
      this.options.locals.basemap = 'light-v9'; // outdoors-v9
      this.options.locals.mapbox_key = config.mapbox.api_key;
    }

    // merge payload into locals so we can access in template
    this.options.locals = _.merge(
      this.options.locals,
      { payload },
      {
        ga: {
          tid: 'UA-101004422-1',
          cid: uuidv4(),
        },
      },
    );

    const email = new EmailTemplate(this.options);
    return email.send(this.options);
  }
}

export default Email;
