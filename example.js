import elasticsearch from 'elasticsearch';
import Promise from 'bluebird';
import moment from 'moment-timezone';
import { richmondVA } from '@statengine/shiftly';
import  _ from 'lodash';

const createESClient = () => new elasticsearch.Client({
  host: process.env.ES_HOST || 'elastic:changeme@localhost:9200',
  apiVersion: process.env.ES_API_VERSION || '5.5'
});

const rvaShift = richmondVA();

const client = createESClient();
const tz = 'US/Eastern';

const rangeFilter = (date) => {
  return {
    'description.event_opened': {
      gte: moment.tz(date, tz),
      lt: moment.tz(date, tz).add(1, 'days'),
      format: 'strict_date_time',
    },
  };
};

const weekFilter = (date) => {
  return {
    'description.event_opened': {
      gte: moment.tz(date, tz).subtract(7, 'days'),
      lt: moment.tz(date, tz),
      format: 'strict_date_time',
    },
  };
};

const shiftFilter = (date) => {
  const { start, end } = rvaShift.shiftTimeFrame(date);
  return {
    'description.event_opened': {
      gte: start,
      lt: end,
      //format: 'strict_date_time',
    },
  };
};

const callCount = (range) => {
  return client.search({
    index: 'richmond',
    body: {
      size: 0,
      aggs: {
        types: {
          terms: {
            field: 'description.type',
            size: 50,
          },
        },
      },
      query: {
        bool: {
          filter: [
            {
              range,
            },
          ],
        },
      },
    },
  });
};

const avgResponseTime = (range) => {
  return client.search({
    index: 'richmond',
    body: {
      size: 0,
      aggs: {
        avg_response_time: { avg: { field: 'description.extended_data.response_time' } },
        response_time_percentiles: { percentiles: { field: 'description.extended_data.response_time', percents: [90] } },
        response_time_percentile_rank: { percentile_ranks: { field: 'description.extended_data.response_time', values: [360] } },
        apparatus_distance_percentile_rank: { percentiles: { field: 'apparatus.distance', percents: [90] } },
        apparatus_turnout_percentile_rank: { percentiles: { field: 'apparatus.extended_data.turnout_duration', percents: [90] } },
        unit_responses: { terms: { field: 'apparatus.unit_id', size: 50 } },
        event_diration_time_percentile_rank: { percentiles: { field: 'description.extended_data.event_duration', percents: [25, 50, 75, 90, 100] } },
      },
      query: {
        bool: {
          filter: [
            {
              range,
            },
          ],
        },
      },
    },
  });
};


const date = '2017-07-07';
const shiftTimeFrame = shiftFilter(date);


const run = (date) => {
  return Promise.all([
    callCount(shiftTimeFrame),
    avgResponseTime(shiftTimeFrame)
]).then((res) => {
    const timeframe = rvaShift.shiftTimeFrame(date);
    const shift = richmondVA().calculateShift(timeframe.start);
    const nums = res.map(results => results.aggregations);
    if (nums[0].types.sum_other_doc_count) {
      console.warn('There are more incident types than buckets.');
    }

    const emsIncidents = nums[0].types.buckets.find(bucket => bucket.key === 'EMS-1STRESP').doc_count;
    const fireIncidents = nums[0].types.buckets.filter(bucket => bucket.key !== 'EMS-1STRESP')
      .reduce((accumulator, bucket) => accumulator + bucket.doc_count, 0);

    const sixMinuteResponses = nums[1].response_time_percentile_rank.values['360.0'].toFixed(2);
    const units = _.groupBy(nums[1].unit_responses.buckets, 'doc_count');
    const unitCounts = {};

    _.entries(units).forEach(unitsByCount => { unitCounts[unitsByCount[0]] = unitsByCount[1].map(obj => _.get(obj, 'key')) });

    const output = `
Shift start: ${moment(timeframe.start).format('LLL')}
Shift end: ${moment(timeframe.end).format('LLL')}
Platoon: ${shift}

Incident Count: ${emsIncidents + fireIncidents}
EMS Incidents ${emsIncidents}
Fire Incidents: ${fireIncidents}
Six Minute Reponse: ${sixMinuteResponses}%
90% Distance to Incident: ${nums[1].apparatus_distance_percentile_rank.values['90.0']}mi
90% Turnout Time: ${nums[1].apparatus_turnout_percentile_rank.values['90.0'].toFixed(2)} seconds
90% Event Durtation:

Incidents per unit:
${_.orderBy(_.toPairs(unitCounts), sum => parseInt(sum[0], 10), ['desc']).map(n => n[0] + ': ' + n[1].sort().join(', ')).join('\n')}`;
    console.log(output);
  });
};

run(date)
