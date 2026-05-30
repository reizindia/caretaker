-- CreateEnum
CREATE TYPE "MarketListingStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'INACTIVE');

-- CreateTable
CREATE TABLE "market_listings" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT,
    "condition" TEXT,
    "status" "MarketListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_messages" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "market_listings" ADD CONSTRAINT "market_listings_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_listings" ADD CONSTRAINT "market_listings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_messages" ADD CONSTRAINT "market_messages_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_messages" ADD CONSTRAINT "market_messages_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "market_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_messages" ADD CONSTRAINT "market_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
