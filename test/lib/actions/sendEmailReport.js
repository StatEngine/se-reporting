import 'chai/register-should';

import SendEmailReport from '../../../src/lib/actions/sendEmailReport';

describe('SendEmailReport', () => {
  it('should make api call to send report', (done) => {
    let action = new SendEmailReport();
    action.run();
  });
});
