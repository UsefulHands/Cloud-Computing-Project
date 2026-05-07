import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the study group platform shell', async () => {
  render(<App />);
  expect(await screen.findByText(/Study Group Platform/i)).toBeInTheDocument();
  expect(await screen.findByText(/Student study groups/i)).toBeInTheDocument();
});
