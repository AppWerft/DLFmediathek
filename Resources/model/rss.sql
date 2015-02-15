DROP TABLE IF EXISTS "feeds";
CREATE TABLE "feeds" ("http_expires" DATETIME, "http_lastmodified" DATETIME, "http_etag" TEXT, "http_contentlength" INTEGER, "title" TEXT, "description" TEXT, "url" TEXT, "faved" INTEGER, "category" TEXT, "pubDate" DATETIME, "lastBuildDate" DATETIME, "image" TEXT);
DROP TABLE IF EXISTS "items";
CREATE TABLE "items" ("channel" TEXT, "title" TEXT NOT NULL , "link" TEXT, "description" TEXT, "guid" TEXT UNIQUE , "enclosure_url" TEXT, "enclosure_length" TEXT, "enclosure_type" TEXT, "author" TEXT, "duration" INTEGER, "pubDate" DATETIME, "watched" INTEGER);
