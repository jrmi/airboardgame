# Backend migration note

The Ricochet.js setup bundle has been replaced by the Node/Feathers backend in
`backend/src`. The browser-facing compatibility surface remains site-prefixed
under `/{VITE_RICOCHET_SITEID}` and includes:

- game, session, room, and user store routes;
- passwordless auth and the signed `session` cookie;
- game media upload/list/download/delete routes;
- the OpenVidu `execute/getConfToken` route; and
- Socket.IO events required by `react-sync-board` and wire-style rooms.

Games are filtered and protected by explicit application services. The current
sibling deployment uses NeDB at `/home/jeremie/Code/airDB`, not MongoDB. Existing
document ids and fields must be retained; Mongo collections default to
`_{siteId}__{box}` and can be overridden with `MONGODB_COLLECTION_GAME`,
`MONGODB_COLLECTION_SESSION`, `MONGODB_COLLECTION_ROOM`, and
`MONGODB_COLLECTION_USER` when an installation uses different names.

The old site-registration/setup endpoints, generic execute functions, generic
Ricochet boxes and the legacy `/file/:namespace` upload helper
are not active frontend dependencies and were dropped. Required configuration
is now `SERVER_HOST`, `SERVER_PORT`, and `RICOCHET_SECRET`; email and OpenVidu
variables remain supported. The backend can read the old NeDB files when
`STORE_BACKEND=nedb` and `NEDB_BACKEND_DIRNAME` are set. The old deployment uses
S3 media is supported when configured with `FILE_STORAGE=s3` and the existing
bucket credentials.
