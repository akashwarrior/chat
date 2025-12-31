import { Chat } from "@/lib/db/schema";
import useSWRInfinite, { SWRInfiniteKeyLoader } from "swr/infinite";

const DEFAULT_PAGE_SIZE = 20;

type GetChatHistoryPaginationKeyArgs = {
  size?: number;
  searchQuery?: string;
}

export const getChatHistoryPaginationKey: SWRInfiniteKeyLoader = (
  index: number,
) => {
  return createChatHistoryPaginationKey(index);
}

export function createChatHistoryPaginationKey(
  index: number,
  args?: GetChatHistoryPaginationKeyArgs,
) {
  const size = args?.size ?? DEFAULT_PAGE_SIZE;
  const searchQuery = args?.searchQuery ?? "";

  return `/api/history?skip=${index * size}&limit=${size}&searchQuery=${searchQuery}`;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to load chat history.");
  }

  return response.json();
};

type UseChatHistoryProps = {
  enabled?: boolean;
  pageSize?: number;
  searchQuery?: string;
}

export function useChatHistory({
  enabled = true,
  pageSize,
  searchQuery = "",
}: UseChatHistoryProps = {}) {
  const resolvedPageSize = pageSize ?? DEFAULT_PAGE_SIZE;
  const { data, error, isValidating, setSize, mutate } = useSWRInfinite<Chat[]>(
    (index) =>
      enabled
        ? createChatHistoryPaginationKey(index, {
            size: resolvedPageSize,
            searchQuery,
          })
        : null,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateFirstPage: false,
    },
  );

  const hasMore =
    data && data.length > 0
      ? data[data.length - 1].length === resolvedPageSize
      : false;

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
    isLoading: enabled && isValidating,
    loadMore: handleLoadMore,
    mutate,
  };
}
