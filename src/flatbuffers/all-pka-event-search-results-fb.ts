// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from "flatbuffers";

import { PkaEventSearchResultFb } from "./pka-event-search-result-fb";

export class AllPkaEventSearchResultsFb {
    bb: flatbuffers.ByteBuffer | null = null;
    bb_pos = 0;

    __init(i: number, bb: flatbuffers.ByteBuffer): AllPkaEventSearchResultsFb {
        this.bb_pos = i;
        this.bb = bb;
        return this;
    }

    static getRootAsAllPkaEventSearchResultsFb(
        bb: flatbuffers.ByteBuffer,
        obj?: AllPkaEventSearchResultsFb
    ): AllPkaEventSearchResultsFb {
        return (obj || new AllPkaEventSearchResultsFb()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }

    static getSizePrefixedRootAsAllPkaEventSearchResultsFb(
        bb: flatbuffers.ByteBuffer,
        obj?: AllPkaEventSearchResultsFb
    ): AllPkaEventSearchResultsFb {
        bb.setPosition(bb.position() + flatbuffers.SIZE_PREFIX_LENGTH);
        return (obj || new AllPkaEventSearchResultsFb()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
    }

    results(index: number, obj?: PkaEventSearchResultFb): PkaEventSearchResultFb | null {
        const offset = this.bb!.__offset(this.bb_pos, 4);
        return offset
            ? (obj || new PkaEventSearchResultFb()).__init(
                  this.bb!.__indirect(this.bb!.__vector(this.bb_pos + offset) + index * 4),
                  this.bb!
              )
            : null;
    }

    resultsLength(): number {
        const offset = this.bb!.__offset(this.bb_pos, 4);
        return offset ? this.bb!.__vector_len(this.bb_pos + offset) : 0;
    }

    static startAllPkaEventSearchResultsFb(builder: flatbuffers.Builder) {
        builder.startObject(1);
    }

    static addResults(builder: flatbuffers.Builder, resultsOffset: flatbuffers.Offset) {
        builder.addFieldOffset(0, resultsOffset, 0);
    }

    static createResultsVector(builder: flatbuffers.Builder, data: flatbuffers.Offset[]): flatbuffers.Offset {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
            builder.addOffset(data[i]!);
        }
        return builder.endVector();
    }

    static startResultsVector(builder: flatbuffers.Builder, numElems: number) {
        builder.startVector(4, numElems, 4);
    }

    static endAllPkaEventSearchResultsFb(builder: flatbuffers.Builder): flatbuffers.Offset {
        const offset = builder.endObject();
        return offset;
    }

    static finishAllPkaEventSearchResultsFbBuffer(builder: flatbuffers.Builder, offset: flatbuffers.Offset) {
        builder.finish(offset);
    }

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
}
