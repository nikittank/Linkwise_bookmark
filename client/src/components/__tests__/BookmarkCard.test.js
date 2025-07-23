import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import BookmarkCard from '../BookmarkCard';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock bookmark data
const mockBookmark = {
  id: 1,
  url: 'https://example.com',
  title: 'Example Website',
  summary: 'This is a test summary of the example website content.',
  tags: 'test, example, website',
  favicon: 'https://example.com/favicon.ico',
  created_at: '2024-01-01T00:00:00.000Z'
};

const mockOnDelete = jest.fn();

describe('BookmarkCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders bookmark information correctly', () => {
    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    expect(screen.getByText('Example Website')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('This is a test summary of the example website content.')).toBeInTheDocument();
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#example')).toBeInTheDocument();
    expect(screen.getByText('#website')).toBeInTheDocument();
  });

  it('displays favicon when available', () => {
    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    const favicon = screen.getByRole('img');
    expect(favicon).toHaveAttribute('src', 'https://example.com/favicon.ico');
  });

  it('handles missing favicon gracefully', () => {
    const bookmarkWithoutFavicon = { ...mockBookmark, favicon: null };
    render(<BookmarkCard bookmark={bookmarkWithoutFavicon} onDelete={mockOnDelete} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('truncates long summaries and shows expand/collapse', () => {
    const longSummary = 'A'.repeat(200);
    const bookmarkWithLongSummary = { ...mockBookmark, summary: longSummary };
    
    render(<BookmarkCard bookmark={bookmarkWithLongSummary} onDelete={mockOnDelete} />);

    expect(screen.getByText('Show more')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Show more'));
    expect(screen.getByText('Show less')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Show less'));
    expect(screen.getByText('Show more')).toBeInTheDocument();
  });

  it('opens delete confirmation modal when delete button is clicked', () => {
    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTitle('Delete bookmark');
    fireEvent.click(deleteButton);

    expect(screen.getByText('Delete Bookmark')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete "Example Website"? This action cannot be undone.')).toBeInTheDocument();
  });

  it('cancels delete when cancel button is clicked', () => {
    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTitle('Delete bookmark');
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Delete Bookmark')).not.toBeInTheDocument();
  });

  it('deletes bookmark when confirmed', async () => {
    mockedAxios.delete.mockResolvedValue({});

    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTitle('Delete bookmark');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/bookmarks/1');
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });
  });

  it('handles delete error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.delete.mockRejectedValue(new Error('Network error'));

    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByTitle('Delete bookmark');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error deleting bookmark:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('opens URL in new tab when clicked', () => {
    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    const urlLink = screen.getByRole('link');
    expect(urlLink).toHaveAttribute('href', 'https://example.com');
    expect(urlLink).toHaveAttribute('target', '_blank');
    expect(urlLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('formats date correctly', () => {
    render(<BookmarkCard bookmark={mockBookmark} onDelete={mockOnDelete} />);

    expect(screen.getByText('Added 1/1/2024')).toBeInTheDocument();
  });

  it('handles bookmark without tags', () => {
    const bookmarkWithoutTags = { ...mockBookmark, tags: '' };
    render(<BookmarkCard bookmark={bookmarkWithoutTags} onDelete={mockOnDelete} />);

    expect(screen.queryByText('#test')).not.toBeInTheDocument();
  });

  it('handles bookmark without summary', () => {
    const bookmarkWithoutSummary = { ...mockBookmark, summary: '' };
    render(<BookmarkCard bookmark={bookmarkWithoutSummary} onDelete={mockOnDelete} />);

    expect(screen.queryByText('🤖 AI Summary')).not.toBeInTheDocument();
  });
});