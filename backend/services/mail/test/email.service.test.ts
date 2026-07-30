import { describe, expect, it, jest } from '@jest/globals';
import { EmailService } from '../src/services/email.services.js';

describe('EmailService', () => {
  it('sends an email using the configured transporter', async () => {
    const sendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    const service = new EmailService({ sendMail } as any);

    const result = await service.send({
      to: 'user@example.com',
      subject: 'Welcome',
      text: '<p>Hello</p>',
    });

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: 'Chat app <no-reply@example.com>',
      to: 'user@example.com',
      subject: 'Welcome',
      html: '<p>Hello</p>',
    }));
    expect(result).toEqual({ messageId: 'test-id' });
  });
});
