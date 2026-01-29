'use client';

import { useState, useCallback } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  /** Room ID */
  roomId: string;
  /** Booking ID for the review */
  bookingId: string;
  /** Callback when review is successfully submitted */
  onSuccess?: () => void;
  /** Additional CSS class */
  className?: string;
}

interface FormState {
  rating: number;
  comment: string;
}

interface FormErrors {
  rating?: string;
  comment?: string;
  submit?: string;
}

export default function ReviewForm({
  roomId,
  bookingId,
  onSuccess,
  className = '',
}: ReviewFormProps) {
  const [form, setForm] = useState<FormState>({
    rating: 0,
    comment: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (form.rating < 1) {
      newErrors.rating = 'Vui lòng chọn số sao';
    }

    if (form.comment.length < 10) {
      newErrors.comment = 'Đánh giá phải có ít nhất 10 ký tự';
    } else if (form.comment.length > 2000) {
      newErrors.comment = 'Đánh giá không được quá 2000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setErrors({});

      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId,
            bookingId,
            rating: form.rating,
            comment: form.comment,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to submit review');
        }

        setSuccess(true);
        onSuccess?.();
      } catch (err) {
        setErrors({
          submit: err instanceof Error ? err.message : 'Có lỗi xảy ra',
        });
      } finally {
        setLoading(false);
      }
    },
    [form, roomId, bookingId, validateForm, onSuccess]
  );

  if (success) {
    return (
      <div
        className={`p-6 rounded-xl bg-green-50 text-green-700 text-center ${className}`}
      >
        <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
        <p className="font-medium">Cảm ơn bạn đã đánh giá!</p>
        <p className="text-sm opacity-80 mt-1">
          Đánh giá của bạn đã được ghi nhận.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-6 rounded-xl bg-primary/5 ${className}`}
    >
      <h3 className="text-xl font-bold mb-4">Viết đánh giá</h3>

      {/* Rating Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Đánh giá của bạn <span className="text-red-500">*</span>
        </label>
        <StarRating
          rating={form.rating}
          onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
          size="lg"
        />
        {errors.rating && (
          <p className="text-sm text-red-500 mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Comment Input */}
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Chia sẻ trải nghiệm của bạn <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          value={form.comment}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, comment: e.target.value }))
          }
          placeholder="Phòng rất đẹp và sạch sẽ..."
          rows={5}
          className="w-full px-4 py-2 rounded-lg border border-primary/20 bg-background-light focus:outline-none focus:ring-2 focus:ring-highlight/50 resize-none"
        />
        <div className="flex justify-between text-sm mt-1">
          <span className="opacity-60">
            Tối thiểu 10 ký tự, tối đa 2000 ký tự
          </span>
          <span
            className={
              form.comment.length > 2000 ? 'text-red-500' : 'opacity-60'
            }
          >
            {form.comment.length}/2000
          </span>
        </div>
        {errors.comment && (
          <p className="text-sm text-red-500 mt-1">{errors.comment}</p>
        )}
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-lg bg-highlight text-white font-medium hover:bg-highlight/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">sync</span>
            Đang gửi...
          </span>
        ) : (
          'Gửi đánh giá'
        )}
      </button>
    </form>
  );
}
