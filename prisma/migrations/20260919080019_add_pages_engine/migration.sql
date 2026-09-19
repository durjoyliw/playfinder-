-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('VENUE', 'CLUB', 'LEAGUE', 'COACH', 'BRAND', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "PageRole" AS ENUM ('OWNER', 'MANAGER', 'ANALYST');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('UNCLAIMED', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VerifyLevel" AS ENUM ('NONE', 'VERIFIED');

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "authorPageId" TEXT;

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PageType" NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'ACTIVE',
    "verify" "VerifyLevel" NOT NULL DEFAULT 'NONE',
    "bio" TEXT,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "city" TEXT,
    "profileData" JSONB,
    "chatChannelId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_memberships" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "PageRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_follows" (
    "pageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_handle_key" ON "pages"("handle");

-- CreateIndex
CREATE INDEX "pages_type_city_idx" ON "pages"("type", "city");

-- CreateIndex
CREATE INDEX "pages_lat_lng_idx" ON "pages"("lat", "lng");

-- CreateIndex
CREATE INDEX "page_memberships_userId_idx" ON "page_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "page_memberships_pageId_userId_key" ON "page_memberships"("pageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "page_follows_pageId_userId_key" ON "page_follows"("pageId", "userId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorPageId_fkey" FOREIGN KEY ("authorPageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_memberships" ADD CONSTRAINT "page_memberships_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_memberships" ADD CONSTRAINT "page_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_follows" ADD CONSTRAINT "page_follows_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_follows" ADD CONSTRAINT "page_follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

