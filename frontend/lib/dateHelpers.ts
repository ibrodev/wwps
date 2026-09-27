export function formatDate(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    const d = new Date(year, month - 1, day);

    return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}