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
}
