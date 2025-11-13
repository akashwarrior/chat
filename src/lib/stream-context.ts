import { after } from "next/server";
import { getRedisClient } from "./redis";
import { createResumableStreamContext, ResumableStreamContext } from "resumable-stream";

export class StreamContext {
    private readonly streamContext: ResumableStreamContext;
    private readonly keyPrefix: string = "chat-stream";
    private readonly publisher = getRedisClient();
    private readonly subscriber = getRedisClient();

    private static instance: StreamContext;

    public static getInstance() {
        if (!StreamContext.instance) {
            StreamContext.instance = new StreamContext();
        }
        return StreamContext.instance;
    }

    private constructor() {
        this.connect();
        this.streamContext = createResumableStreamContext({
            waitUntil: after,
            keyPrefix: this.keyPrefix,
            publisher: this.publisher,
            subscriber: this.subscriber,
        });
    }

    private async connect() {
        await Promise.all([
            this.publisher.connect(),
            this.subscriber.connect(),
        ]);
    }

    public getStreamContext() {
        return this.streamContext;
    }
}