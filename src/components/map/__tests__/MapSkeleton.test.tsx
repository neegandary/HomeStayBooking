import { render, screen } from '@testing-library/react';
import MapSkeleton from '../MapSkeleton';

describe('MapSkeleton', () => {
  it('should render with default height', () => {
    render(<MapSkeleton />);

    // Use testId to find the skeleton container
    expect(screen.getByTestId('map-skeleton')).toBeInTheDocument();
  });

  it('should render with custom height', () => {
    render(<MapSkeleton height="500px" className="test-skeleton" />);

    // Find by custom class
    const skeleton = document.querySelector('.test-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveStyle({ height: '500px' });
  });

  it('should render skeleton elements', () => {
    render(<MapSkeleton />);

    // Check for loading indicator
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('should accept additional className', () => {
    render(<MapSkeleton className="custom-class" />);

    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });
});
