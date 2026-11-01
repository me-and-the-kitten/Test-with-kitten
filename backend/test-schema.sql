-- Test fixture matching db/schema.ts. Production migrations must be generated
-- using npm run db:generate; this file is never applied by request handlers.
CREATE TABLE cat_counts_p5 (cat_key TEXT PRIMARY KEY NOT NULL, total INTEGER NOT NULL DEFAULT 0, CONSTRAINT cat_counts_p5_key CHECK(length(cat_key) BETWEEN 11 AND 14 AND cat_key NOT GLOB '*[^0-9.]*' AND length(cat_key)-length(replace(cat_key,'.',''))=5), CONSTRAINT cat_counts_p5_nonnegative CHECK(total>=0));
CREATE TABLE cat_finds_p5 (visitor TEXT NOT NULL, cat_key TEXT NOT NULL, PRIMARY KEY(visitor,cat_key), CONSTRAINT cat_finds_p5_key CHECK(length(cat_key) BETWEEN 11 AND 14 AND cat_key NOT GLOB '*[^0-9.]*' AND length(cat_key)-length(replace(cat_key,'.',''))=5));
