export const sendEmail = jest
  .fn()
  .mockResolvedValue({ data: { id: 'mock_email_id' }, error: null });

// If the 'resend' instance itself is directly used and needs mocking:
// export const resend = {
//   emails: {
//     send: jest.fn().mockResolvedValue({ id: 'mock_email_id' }),
//   },
// };
