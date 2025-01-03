"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var orama_1 = require("@orama/orama");
var db_1 = require("./server/db");
var orama = (0, orama_1.create)({
    schema: {
        subject: 'string',
        body: 'string',
        rawBody: 'string',
        from: 'string',
        to: 'string',
        sentAt: 'string',
        threadId: 'string',
    }
});
var emails = await db_1.db.email.findMany({
    select: {
        subject: true,
        body: true,
        from: true,
        to: true,
        sentAt: true,
        threadId: true,
    }
});
for (var _i = 0, emails_1 = emails; _i < emails_1.length; _i++) {
    var email = emails_1[_i];
    console.log(email.subject);
}
