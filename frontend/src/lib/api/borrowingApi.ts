export const getLastBorrowed = async (email: string, account: string, backendUrl: string): Promise<number> => {
    const res = await fetch(`${backendUrl}/lastBorrowed?email=${email}&account=${account}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch last borrowed timestamp");
    return data.lastBorrowedTimestamp;
};

export const postBorrow = async (email: string, account: string, backendUrl: string) => {
    const res = await fetch(`${backendUrl}/borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, account }),
    });
    if (!res.ok) throw new Error("Borrow request failed");
};

export const postWhitelist = async (email: string, account: string, backendUrl: string) => {
    const res = await fetch(`${backendUrl}/whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, account, isWhitelisted: true }),
    });
    if (!res.ok) throw new Error("Whitelist request failed");
};

export const getUserByWallet = async (account: string, backendUrl: string) => {
    const res = await fetch(`${backendUrl}/users/email/${account}`);
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch wallet user");
    return data;
};
