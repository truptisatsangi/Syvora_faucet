export const getTimeLeftString = (lastBorrowed: number | null): string | null => {
    if (!lastBorrowed) return null;

    const nextBorrowTime = lastBorrowed + 8 * 60 * 60 * 1000;
    const timeLeft = nextBorrowTime - Date.now();

    if (timeLeft <= 0) return null;

    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

    return `${hours}h ${minutes}m`;
};

export const canBorrowNow = (lastBorrowed: number | null): boolean => {
    if (!lastBorrowed) return true;
    const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000;
    return lastBorrowed < eightHoursAgo;
};
