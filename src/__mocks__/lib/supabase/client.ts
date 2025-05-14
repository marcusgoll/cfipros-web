export const createSupabaseBrowserClient = jest.fn();
export const createSupabaseServerClient = jest.fn();

// Add any other key functions from the actual client that need mocking
// For example, if the client instance has methods:
// const mockSupabaseClient = {
//   from: jest.fn().mockReturnThis(),
//   select: jest.fn().mockReturnThis(),
//   insert: jest.fn().mockReturnThis(),
//   update: jest.fn().mockReturnThis(),
//   delete: jest.fn().mockReturnThis(),
//   auth: {
//     signInWithPassword: jest.fn(),
//     signUp: jest.fn(),
//     signOut: jest.fn(),
//     onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
//   },
// };

// If createSupabase...Client returns an instance:
// createSupabaseBrowserClient.mockReturnValue(mockSupabaseClient);
// createSupabaseServerClient.mockReturnValue(mockSupabaseClient);
