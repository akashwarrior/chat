import { Chat } from "@/lib/db/schema";
import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";

const DEFAULT_PAGE_SIZE = 20;

type GetChatHistoryPaginationKeyArgs = {
  size?: number;
  searchQuery?: string;
}

export const getChatHistoryPaginationKey: SWRInfiniteKeyLoader = (
  index: number,
  args?: GetChatHistoryPaginationKeyArgs
) => {
  const size = args?.size ?? DEFAULT_PAGE_SIZE;
  const searchQuery = args?.searchQuery ?? "";

  return `/api/history?skip=${index * size}&limit=${size}&searchQuery=${searchQuery}`;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type UseChatHistoryProps = {
  pageSize?: number;
  searchQuery?: string;
}

export function useChatHistory({
  pageSize,
  searchQuery = "",
}: UseChatHistoryProps = {}) {
  const { data, error, isValidating, setSize, mutate } = useSWRInfinite<Chat[]>(
    (index) => getChatHistoryPaginationKey(index, { size: pageSize, searchQuery }),
    fetcher,
    { revalidateOnMount: true },
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
