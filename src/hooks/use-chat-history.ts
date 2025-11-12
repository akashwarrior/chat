import { Chat } from "@/lib/db/schema";
import useSWRInfinite from "swr/infinite";

const DEFAULT_PAGE_SIZE = 20;

export const getChatHistoryPaginationKey = (index: number, size?: number) =>
    `/api/history?skip=${index * (size ?? DEFAULT_PAGE_SIZE)}&limit=${size ?? DEFAULT_PAGE_SIZE}`;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useChatHistory({ pageSize = DEFAULT_PAGE_SIZE }: { pageSize?: number } = {}) {
    const { data, error, isValidating, setSize, mutate } = useSWRInfinite<Chat[]>(
        (index) => getChatHistoryPaginationKey(index, pageSize),
        fetcher,
        { revalidateOnMount: true }
    );

    const hasMore = data?.[data.length - 1]?.length === pageSize;

    const handleLoadMore = () => {
        if (!hasMore || isValidating) {
            return;
        }
        setSize((prev) => prev + 1);
    };

    return {
        data,
        hasMore,
        error,
        isLoading: isValidating,
        loadMore: handleLoadMore,
        mutate,
    };
}