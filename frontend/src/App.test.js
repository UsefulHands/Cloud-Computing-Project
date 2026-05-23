import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  localStorage.setItem(
    'studygroup_user',
    JSON.stringify({
      userId: 1,
      fullName: 'Test User',
      email: 'test@test.com',
      accessToken: 'dev-token-user-1',
    })
  );
});

afterEach(() => {
  localStorage.clear();
});

test('renders the study group platform shell when logged in', async () => {
  render(<App />);
  expect(await screen.findByText(/Study Group Platform/i)).toBeInTheDocument();
  expect(await screen.findByText(/StudyGroup/i)).toBeInTheDocument();
});
