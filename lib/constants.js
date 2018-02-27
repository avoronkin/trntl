module.exports = {
    REQUEST: {
        SELECT:    1,
        INSERT:    2,
        REPLACE:   3,
        UPDATE:    4,
        DELETE:    5,
        CALL:      6, /* CALL IN 1.6 FORMAT */
        AUTH:      7,
        EVAL:      8,
        UPSERT:    9,
        CALL17:    10,
        PING:      64,
        SUBSCRIBE: 66,
    },

    IPROTO: {
        CODE:          0x00,
        SYNC:          0x01,
        // # replication keys (header)
        SERVER_ID:     0x02,
        LSN:           0x03,
        TIMESTAMP:     0x04,
        SCHEMA_ID:     0X05,
        // #
        SPACE_ID:      0x10,
        INDEX_ID:      0x11,
        LIMIT:         0x12,
        OFFSET:        0x13,
        ITERATOR:      0x14,
        INDEX_BASE:    0x15,
        // #
        KEY:           0x20,
        TUPLE:         0x21,
        FUNCTION_NAME: 0x22,
        USER_NAME:     0x23,
        // #
        SERVER_UUID:   0x24,
        CLUSTER_UUID:  0x25,
        VCLOCK:        0x26,
        EXPR:          0x27,
        OPS:           0x28,
        // #
        DATA:          0x30,
        ERROR:         0x31,
    }
}
