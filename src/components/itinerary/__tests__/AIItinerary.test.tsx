/**
 * Unit tests for AIItinerary component
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AIItinerary from '../AIItinerary';
import AIItinerarySkeleton from '../AIItinerarySkeleton';
import api from '@/lib/axios';

// Mock axios
jest.mock('@/lib/axios', () => ({
  post: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('AIItinerary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Skeleton Component', () => {
    it('should render skeleton with correct structure', () => {
      render(<AIItinerarySkeleton />);

      expect(screen.getByTestId('ai-itinerary-skeleton')).toBeInTheDocument();
    });
  });

  describe('Input Form', () => {
    it('should render input form by default', () => {
      render(<AIItinerary />);

      expect(screen.getByPlaceholderText('Nhập tên của bạn...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tạo lịch trình/i })).toBeInTheDocument();
      expect(screen.getByText('Phong cách du lịch')).toBeInTheDocument();
    });

    it('should update guest name on input', () => {
      render(<AIItinerary />);

      const input = screen.getByPlaceholderText('Nhập tên của bạn...');
      fireEvent.change(input, { target: { value: 'Test User' } });

      expect(input).toHaveValue('Test User');
    });

    it('should update stay duration on slider change', () => {
      render(<AIItinerary />);

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '5' } });

      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should select vibe on button click', () => {
      render(<AIItinerary />);

      const romanticButton = screen.getByRole('button', { name: /Lãng mạn/i });
      fireEvent.click(romanticButton);

      expect(romanticButton).toHaveClass('ring-2');
    });
  });

  describe('API Integration', () => {
    it('should call API on form submit', async () => {
      mockedApi.post.mockResolvedValue({
        data: {
          itinerary: {
            intro: 'Chào mừng Test User đến Đà Lạt!',
            days: [
              {
                day: 1,
                theme: 'Khám phá thành phố',
                activities: [
                  { time: '08:00', task: 'Ăn sáng', desc: 'Bánh căn', pro_tip: 'Đến sớm' },
                ],
              },
            ],
          },
        },
      });

      render(<AIItinerary />);

      const input = screen.getByPlaceholderText('Nhập tên của bạn...');
      fireEvent.change(input, { target: { value: 'Test User' } });

      const submitButton = screen.getByRole('button', { name: /Tạo lịch trình/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedApi.post).toHaveBeenCalledWith('/itinerary', {
          guestName: 'Test User',
          stayDuration: 2,
          vibe: 'mixed',
        });
      });
    });

    it('should display itinerary on success', async () => {
      mockedApi.post.mockResolvedValue({
        data: {
          itinerary: {
            intro: 'Chào mừng Test User đến Đà Lạt!',
            days: [
              {
                day: 1,
                theme: 'Khám phá thành phố mù sương',
                activities: [
                  { time: '08:00', task: 'Ăn sáng bánh căn', desc: 'Thưởng thức bánh căn Đà Lạt', pro_tip: 'Đến sớm để tránh đông' },
                ],
              },
            ],
          },
        },
      });

      render(<AIItinerary />);

      const input = screen.getByPlaceholderText('Nhập tên của bạn...');
      fireEvent.change(input, { target: { value: 'Test User' } });

      const submitButton = screen.getByRole('button', { name: /Tạo lịch trình/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Chào mừng Test User đến Đà Lạt!')).toBeInTheDocument();
        expect(screen.getByText('Khám phá thành phố mù sương')).toBeInTheDocument();
        expect(screen.getByText('08:00')).toBeInTheDocument();
        expect(screen.getByText('Ăn sáng bánh căn')).toBeInTheDocument();
      });
    });

    it('should display error on API failure', async () => {
      mockedApi.post.mockRejectedValue(new Error('API Error'));

      render(<AIItinerary />);

      const input = screen.getByPlaceholderText('Nhập tên của bạn...');
      fireEvent.change(input, { target: { value: 'Test User' } });

      const submitButton = screen.getByRole('button', { name: /Tạo lịch trình/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Thử lại/i })).toBeInTheDocument();
      });
    });
  });

  describe('Regenerate', () => {
    it('should show regenerate button after itinerary generated', async () => {
      mockedApi.post.mockResolvedValue({
        data: {
          itinerary: {
            intro: 'Welcome',
            days: [
              {
                day: 1,
                theme: 'Day 1',
                activities: [{ time: '08:00', task: 'Activity', desc: 'Desc', pro_tip: 'Tip' }],
              },
            ],
          },
        },
      });

      render(<AIItinerary />);

      const input = screen.getByPlaceholderText('Nhập tên của bạn...');
      fireEvent.change(input, { target: { value: 'Test' } });

      const submitButton = screen.getByRole('button', { name: /Tạo lịch trình/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Tạo lịch trình mới/i })).toBeInTheDocument();
      });

      // Click regenerate
      const regenerateButton = screen.getByRole('button', { name: /Tạo lịch trình mới/i });
      fireEvent.click(regenerateButton);

      // Should show form again
      expect(screen.getByPlaceholderText('Nhập tên của bạn...')).toBeInTheDocument();
    });
  });
});

describe('AIItinerarySkeleton', () => {
  it('should render without errors', () => {
    render(<AIItinerarySkeleton />);
    expect(document.body).toBeTruthy();
  });

  it('should have animate-pulse class', () => {
    render(<AIItinerarySkeleton />);
    const container = document.querySelector('.animate-pulse');
    expect(container).toBeInTheDocument();
  });
});
