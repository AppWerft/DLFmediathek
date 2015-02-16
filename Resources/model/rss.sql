CREATE TABLE "feeds" IF NOT EXISTS ("url" TEXT, "http_expires" DATETIME, "http_lastmodified" DATETIME, "http_etag" TEXT, "http_contentlength" INTEGER, "title" TEXT, "description" TEXT, "url" TEXT, "faved" INTEGER, "category" TEXT, "pubDate" DATETIME, "lastBuildDate" DATETIME, "image" TEXT);

CREATE TABLE "items" IF NOT EXISTS ("url" TEXT, "title" TEXT NOT NULL , "link" TEXT, "description" TEXT, "guid" TEXT UNIQUE , "enclosure_url" TEXT, "enclosure_length" TEXT, "enclosure_type" TEXT, "author" TEXT, "duration" INTEGER, "pubDate" DATETIME, "watched" INTEGER);


CREATE INDEX IF NOT EXISTS "urlindex" ON "items" (url);