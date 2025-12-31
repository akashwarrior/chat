import { after } from "next/server";
import {
  createResumableStreamContext,
  type ResumableStreamContext,
} from "resumable-stream";
import { createConnectedRedisClient } from "./redis";

export class StreamContext {
  private readonly keyPrefix = "chat-stream";
  private readonly streamContextPromise: Promise<ResumableStreamContext>;

  private static instance: StreamContext;

  public static getInstance() {
    if (!StreamContext.instance) {
      StreamContext.instance = new StreamContext();
    }

    return StreamContext.instance;
  }

  private constructor() {
    this.streamContextPromise = this.createStreamContext();
  }

  private async createStreamContext() {
    const [publisher, subscriber] = await Promise.all([
      createConnectedRedisClient(),
      createConnectedRedisClient(),
    ]);

    return createResumableStreamContext({
      waitUntil: after,
      keyPrefix: this.keyPrefix,
      publisher,
      subscriber,
    });
  }

  public async getStreamContext() {
    return this.streamContextPromise;
  }
}