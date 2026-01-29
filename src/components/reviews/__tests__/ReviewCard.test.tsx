import { render, screen } from '@testing-library/react';
import ReviewCard from '../ReviewCard';

describe('ReviewCard', () => {
  const mockReview = {
    id: '1',
    userId: { id: 'u1', name: 'Test User' },
    rating: 4,
    comment: 'Great room, very clean and comfortable.',
    isVerified: true,
    createdAt: '2025-12-15T10:00:00Z',
  };

  it('should render user name', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render rating stars', () => {
    render(<ReviewCard review={mockReview} />);

    const filledStars = screen.getAllByText('star');
    expect(filledStars).toHaveLength(4);
  });

  it('should render comment', () => {
    render(<ReviewCard review={mockReview} />);

    // Comment is wrapped in quotes
    expect(screen.getByText(/"Great room, very clean and comfortable."/)).toBeInTheDocument();
  });

  it('should show verified badge when isVerified is true', () => {
    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Đã xác nhận đã ở')).toBeInTheDocument();
  });

  it('should not show verified badge when isVerified is false', () => {
    render(<ReviewCard review={{ ...mockReview, isVerified: false }} />);

    expect(screen.queryByText('Đã xác nhận đã ở')).not.toBeInTheDocument();
  });

  it('should format date in Vietnamese locale', () => {
    render(<ReviewCard review={mockReview} />);

    // Check for date part (month and year)
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });

  it('should handle anonymous user', () => {
    render(<ReviewCard review={{ ...mockReview, userId: undefined }} />);

    expect(screen.getByText('Người dùng ẩn danh')).toBeInTheDocument();
  });
});
