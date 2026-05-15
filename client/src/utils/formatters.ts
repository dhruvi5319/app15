export const formatters = {
  vintage: (year: number | null): string => (year ? String(year) : '—'),
  bottleCount: (count: number): string => `${count} bottle${count !== 1 ? 's' : ''}`,
  rating: (rating: number | null): string => (rating ? '★'.repeat(rating) : 'No rating'),
  date: (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
};
