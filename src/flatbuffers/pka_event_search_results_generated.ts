// automatically generated by the FlatBuffers compiler, do not modify

/**
 * @constructor
 */
export class PkaEventSearchResultFb {
    bb: flatbuffers.ByteBuffer | null = null;

    bb_pos = 0;

    /**
     * @returns PkaEventSearchResultFb
     * @param bb
     * @param obj
     */
    static getRootAsPkaEventSearchResultFb(
        bb: flatbuffers.ByteBuffer,
        obj?: PkaEventSearchResultFb
    ): PkaEventSearchResultFb {
        return (obj || new PkaEventSearchResultFb()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }

    /**
     * @returns PkaEventSearchResultFb
     * @param bb
     * @param obj
     */
    static getSizePrefixedRootAsPkaEventSearchResultFb(
        bb: flatbuffers.ByteBuffer,
        obj?: PkaEventSearchResultFb
    ): PkaEventSearchResultFb {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new PkaEventSearchResultFb()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }

    /**
     */
    static startPkaEventSearchResultFb(builder: flatbuffers.Builder) {
        builder.startObject(5);
    }

    /**
     * @param builder
     * @param episodeNumber
     */
    static addEpisodeNumber(builder: flatbuffers.Builder, episodeNumber: number) {
        builder.addFieldFloat32(0, episodeNumber, 0.0);
    }

    /**
     * @param builder
     * @param timestamp
     */
    static addTimestamp(builder: flatbuffers.Builder, timestamp: number) {
        builder.addFieldInt32(1, timestamp, 0);
    }

    /**
     */
    static addDescription(builder: flatbuffers.Builder, descriptionOffset: flatbuffers.Offset) {
        builder.addFieldOffset(2, descriptionOffset, 0);
    }

    /**
     * @param builder
     * @param lengthSeconds
     */
    static addLengthSeconds(builder: flatbuffers.Builder, lengthSeconds: number) {
        builder.addFieldInt32(3, lengthSeconds, 0);
    }

    /**
     */
    static addUploadDate(builder: flatbuffers.Builder, uploadDate: flatbuffers.Long) {
        builder.addFieldInt64(4, uploadDate, builder.createLong(0, 0));
    }

    /**
     * @returns flatbuffers.Offset
     */
    static endPkaEventSearchResultFb(builder: flatbuffers.Builder): flatbuffers.Offset {
        return builder.endObject();
    }

    static createPkaEventSearchResultFb(
        builder: flatbuffers.Builder,
        episodeNumber: number,
        timestamp: number,
        descriptionOffset: flatbuffers.Offset,
        lengthSeconds: number,
        uploadDate: flatbuffers.Long
    ): flatbuffers.Offset {
        PkaEventSearchResultFb.startPkaEventSearchResultFb(builder);
        PkaEventSearchResultFb.addEpisodeNumber(builder, episodeNumber);
        PkaEventSearchResultFb.addTimestamp(builder, timestamp);
        PkaEventSearchResultFb.addDescription(builder, descriptionOffset);
        PkaEventSearchResultFb.addLengthSeconds(builder, lengthSeconds);
        PkaEventSearchResultFb.addUploadDate(builder, uploadDate);
        return PkaEventSearchResultFb.endPkaEventSearchResultFb(builder);
    }

    /**
     * @returns PkaEventSearchResultFb
     * @param i
     * @param bb
     */
    __init(i: number, bb: flatbuffers.ByteBuffer): PkaEventSearchResultFb {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }

    /**
     * @returns number
     */
    episodeNumber(): number {
        const offset = this.bb!.__offset(this.bb_pos, 4);
        return offset ? this.bb!.readFloat32(this.bb_pos + offset) : 0.0;
    }

    /**
     * @returns number
     */
    timestamp(): number {
        const offset = this.bb!.__offset(this.bb_pos, 6);
        return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
    }

    /**
     * @returns string|Uint8Array|null
     */
    description(): string;

    description(optionalEncoding: flatbuffers.Encoding): string | Uint8Array | null;

    description(optionalEncoding?: any): string | Uint8Array | null {
        const offset = this.bb!.__offset(this.bb_pos, 8);
        return offset ? this.bb!.__string(this.bb_pos + offset, optionalEncoding) : null;
    }

    /**
     * @returns number
     */
    lengthSeconds(): number {
        const offset = this.bb!.__offset(this.bb_pos, 10);
        return offset ? this.bb!.readInt32(this.bb_pos + offset) : 0;
    }

    /**
     * @returns flatbuffers.Long
     */
    uploadDate(): flatbuffers.Long {
        const offset = this.bb!.__offset(this.bb_pos, 12);
        return offset ? this.bb!.readInt64(this.bb_pos + offset) : this.bb!.createLong(0, 0);
    }
}

/**
 * @constructor
 */
export class AllPkaEventSearchResultsFb {
    bb: flatbuffers.ByteBuffer | null = null;

    bb_pos = 0;

    /**
     * @returns AllPkaEventSearchResultsFb
     * @param bb
     * @param obj
     */
    static getRootAsAllPkaEventSearchResultsFb(
        bb: flatbuffers.ByteBuffer,
        obj?: AllPkaEventSearchResultsFb
    ): AllPkaEventSearchResultsFb {
        return (obj || new AllPkaEventSearchResultsFb()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }

    /**
     * @returns AllPkaEventSearchResultsFb
     * @param bb
     * @param obj
     */
    static getSizePrefixedRootAsAllPkaEventSearchResultsFb(
        bb: flatbuffers.ByteBuffer,
        obj?: AllPkaEventSearchResultsFb
    ): AllPkaEventSearchResultsFb {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new AllPkaEventSearchResultsFb()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }

    /**
     */
    static startAllPkaEventSearchResultsFb(builder: flatbuffers.Builder) {
        builder.startObject(1);
    }

    /**
     */
    static addResults(builder: flatbuffers.Builder, resultsOffset: flatbuffers.Offset) {
        builder.addFieldOffset(0, resultsOffset, 0);
    }

    /**
     * @returns flatbuffers.Offset
     * @param builder
     * @param data
     */
    static createResultsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]);
        }
        return builder.endVector();
    }

    /**
     */
    static startResultsVector(builder: flatbuffers.Builder, numElems: number) {
        builder.startVector(4, numElems, 4);
    }

    /**
     * @returns flatbuffers.Offset
     */
    static endAllPkaEventSearchResultsFb(builder: flatbuffers.Builder): flatbuffers.Offset {
        return builder.endObject();
    }

    /**
     */
    static finishAllPkaEventSearchResultsFbBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset) {
        builder.finish(offset);
    }

    /**
     */
    static finishSizePrefixedAllPkaEventSearchResultsFbBuffer(
        builder: flatbuffers.Builder,
        offset: flatbuffers.Offset
    ) {
        builder.finish(offset, undefined, true);
    }

    static createAllPkaEventSearchResultsFb(
        builder: flatbuffers.Builder,
        resultsOffset: flatbuffers.Offset
    ): flatbuffers.Offset {
        AllPkaEventSearchResultsFb.startAllPkaEventSearchResultsFb(builder);
        AllPkaEventSearchResultsFb.addResults(builder, resultsOffset);
        return AllPkaEventSearchResultsFb.endAllPkaEventSearchResultsFb(builder);
    }

    /**
     * @returns AllPkaEventSearchResultsFb
     * @param i
     * @param bb
     */
    __init(i: number, bb: flatbuffers.ByteBuffer): AllPkaEventSearchResultsFb {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }

    /**
     * @returns PkaEventSearchResultFb
     * @param index
     * @param obj
     */
    results(index: number, obj?: PkaEventSearchResultFb): PkaEventSearchResultFb | null {
        const offset = this.bb!.__offset(this.bb_pos, 4);
        return offset
            ? (obj || new PkaEventSearchResultFb()).__init(
                  this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4),
                  this.bb!
              )
            : null;
    }

    /**
     * @returns number
     */
    resultsLength(): number {
        const offset = this.bb!.__offset(this.bb_pos, 4);
        return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
    }
}
