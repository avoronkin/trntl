module.exports = {
    PREFIX_LENGTH: 5,
    HEAD_LENGTH: 23,

    REQUEST: {
        /** SELECT request */
        SELECT:    1,
        /** INSERT request */
        INSERT:    2,
        /** REPLACE request */
        REPLACE:   3,
        /** UPDATE request */
        UPDATE:    4,
        /** DELETE request */
        DELETE:    5,
        /** CALL request */
        CALL16:      6,
        /** AUTH request */
        AUTH:      7,
        /** EVAL request */
        EVAL:      8,
        /** UPSERT request */
        UPSERT:    9,
        /** CALL request - returns arbitrary MessagePack */
        CALL:    10,
        /** Execute an SQL statement. */
        EXECUTE:   11,
        /** No operation. Treated as DML, used to bump LSN. */
        NOP:       12,
        /** PING request */
        PING:      64,
    },

    IPROTO: {
        CODE:          0x00,
        SYNC:          0x01,
        // #
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
        FIELD_NAME:    0x29,
        // #
        DATA:          0x30,
        ERROR:         0x31,
        METADATA:      0x32,

        SQL_TEXT:      0x40,
        SQL_BIND:      0x41,
        SQL_OPTIONS:   0x42,
        SQL_INFO:      0x43,
        SQL_ROW_COUNT: 0x44,
    },

    ITERATOR_TYPES: {
        eq:            0,
        req:           1,
        all:           2,
        lt:            3,
        le:            4,
        ge:            5,
        gt:            6,
        bitsAllSet:    7,
        bitsAnySet:    8,
        bitsAllNotSet: 9
    },

    SPACE: {
        SCHEMA:        272,
        SPACE:         281,
        INDEX:         289,
        FUNC:          296,
        USER:          304,
        PRIV:          312,
        CLUSTER:       320,
    },

    INDEX_SPACE: {
        PRIMARY:       0,
        NAME:          2,
        INDEX_PRIMARY: 0,
        INDEX_NAME:    2
    }
}
