import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from '../StarRating';

describe('StarRating', () => {
  it('should render 5 stars', () => {
    render(<StarRating rating={4} readonly />);

    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('should display filled stars up to rating', () => {
    render(<StarRating rating={3} readonly />);

    const filledStars = screen.getAllByText('star');
    const emptyStars = screen.getAllByText('star_border');

    expect(filledStars).toHaveLength(3);
    expect(emptyStars).toHaveLength(2);
  });

  it('should highlight stars on hover when interactive', () => {
    render(<StarRating rating={2} />);

    const fourthStar = screen.getAllByRole('button')[3];

    fireEvent.mouseEnter(fourthStar);

    const filledStars = screen.getAllByText('star');
    expect(filledStars).toHaveLength(4);
  });

  it('should call onChange when clicking a star', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={1} onChange={handleChange} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[2]); // Click 3rd star (index 2)

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('should not call onChange when readonly', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={3} readonly onChange={handleChange} />);

    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[0]);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should support different sizes', () => {
    const { container: smallContainer } = render(<StarRating rating={5} size="sm" readonly />);
    const smallIcon = smallContainer.querySelector('.text-lg');

    const { container: largeContainer } = render(<StarRating rating={5} size="lg" readonly />);
    const largeIcon = largeContainer.querySelector('.text-3xl');

    expect(smallIcon).toBeInTheDocument();
    expect(largeIcon).toBeInTheDocument();
  });
});
