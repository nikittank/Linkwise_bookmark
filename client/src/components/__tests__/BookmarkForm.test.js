import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BookmarkForm from '../BookmarkForm';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

const mockOnBookmarkAdded = jest.fn();

describe('BookmarkForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    expect(screen.getByText('Add New Bookmark')).toBeInTheDocument();
    expect(screen.getByText('Save any URL with AI-powered summary')).toBeInTheDocument();
    expect(screen.getByLabelText('Website URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags (optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save bookmark/i })).toBeInTheDocument();
  });

  it('updates input values when typed', () => {
    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const urlInput = screen.getByLabelText('Website URL');
    const tagsInput = screen.getByLabelText('Tags (optional)');

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(tagsInput, { target: { value: 'test, example' } });

    expect(urlInput).toHaveValue('https://example.com');
    expect(tagsInput).toHaveValue('test, example');
  });

  it('submits form with valid data', async () => {
    const mockBookmark = {
      id: 1,
      url: 'https://example.com',
      title: 'Example',
      summary: 'Test summary',
      tags: 'test, example'
    };

    mockedAxios.post.mockResolvedValue({ data: mockBookmark });

    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const urlInput = screen.getByLabelText('Website URL');
    const tagsInput = screen.getByLabelText('Tags (optional)');
    const submitButton = screen.getByRole('button', { name: /save bookmark/i });

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(tagsInput, { target: { value: 'test, example' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/bookmarks', {
        url: 'https://example.com',
        tags: 'test, example'
      });
      expect(mockOnBookmarkAdded).toHaveBeenCalledWith(mockBookmark);
    });

    // Form should be cleared after successful submission
    expect(urlInput).toHaveValue('');
    expect(tagsInput).toHaveValue('');
  });

  it('shows loading state during submission', async () => {
    mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const urlInput = screen.getByLabelText('Website URL');
    const submitButton = screen.getByRole('button', { name: /save bookmark/i });

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Generating AI Summary...')).toBeInTheDocument();
    expect(screen.getByText('Processing your bookmark...')).toBeInTheDocument();
    expect(screen.getByText('📄 Extracting page metadata')).toBeInTheDocument();
    expect(screen.getByText('🤖 Generating AI summary with Jina AI')).toBeInTheDocument();
    expect(screen.getByText('💾 Saving to your collection')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('displays error message on submission failure', async () => {
    const errorMessage = 'Invalid URL format';
    mockedAxios.post.mockRejectedValue({
      response: { data: { error: errorMessage } }
    });

    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const urlInput = screen.getByLabelText('Website URL');
    const submitButton = screen.getByRole('button', { name: /save bookmark/i });

    fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockOnBookmarkAdded).not.toHaveBeenCalled();
  });

  it('displays generic error message when no specific error is provided', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Network error'));

    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const urlInput = screen.getByLabelText('Website URL');
    const submitButton = screen.getByRole('button', { name: /save bookmark/i });

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save bookmark')).toBeInTheDocument();
    });
  });

  it('prevents submission with empty URL', () => {
    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const submitButton = screen.getByRole('button', { name: /save bookmark/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submission when URL is provided', () => {
    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const urlInput = screen.getByLabelText('Website URL');
    const submitButton = screen.getByRole('button', { name: /save bookmark/i });

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    expect(submitButton).not.toBeDisabled();
  });

  it('works without tags', async () => {
    const mockBookmark = {
      id: 1,
      url: 'https://example.com',
      title: 'Example',
      summary: 'Test summary',
      tags: ''
    };

    mockedAxios.post.mockResolvedValue({ data: mockBookmark });

    render(<BookmarkForm onBookmarkAdded={mockOnBookmarkAdded} />);

    const urlInput = screen.getByLabelText('Website URL');
    const submitButton = screen.getByRole('button', { name: /save bookmark/i });

    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/bookmarks', {
        url: 'https://example.com',
        tags: ''
      });
    });
  });
});