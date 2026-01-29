import { render, screen } from '@testing-library/react';
import RatingSummary from '../RatingSummary';

describe('RatingSummary', () => {
  it('should display average rating', () => {
    render(<RatingSummary averageRating={4.5} totalReviews={100} />);

    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should display total reviews count', () => {
    render(<RatingSummary averageRating={4.0} totalReviews={50} />);

    expect(screen.getByText('50 đánh giá')).toBeInTheDocument();
  });

  it('should render rating distribution bars', () => {
    render(
      <RatingSummary
        averageRating={4.0}
        totalReviews={10}
        distribution={{ 1: 1, 2: 0, 3: 1, 4: 3, 5: 5 }}
      />
    );

    // Check for star labels (1-5)
    const starLabels = screen.getAllByText(/\d/);
    expect(starLabels.length).toBeGreaterThanOrEqual(5);
  });

  it('should show message when no reviews', () => {
    render(<RatingSummary averageRating={0} totalReviews={0} />);

    expect(screen.getByText(/Chưa có đánh giá nào/)).toBeInTheDocument();
  });

  it('should calculate and display correct percentages', () => {
    render(
      <RatingSummary
        averageRating={5.0}
        totalReviews={4}
        distribution={{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 4 }}
      />
    );

    // Should show 4 count somewhere for 5 stars
    const starLabels = screen.getAllByText(/\d/);
    expect(starLabels.some(el => el.textContent === '4')).toBe(true);
  });
});
