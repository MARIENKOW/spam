-- CreateTable
CREATE TABLE "_BlogBodyImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlogBodyImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BlogBodyVideos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlogBodyVideos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BlogBodyImages_B_index" ON "_BlogBodyImages"("B");

-- CreateIndex
CREATE INDEX "_BlogBodyVideos_B_index" ON "_BlogBodyVideos"("B");

-- AddForeignKey
ALTER TABLE "_BlogBodyImages" ADD CONSTRAINT "_BlogBodyImages_A_fkey" FOREIGN KEY ("A") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogBodyImages" ADD CONSTRAINT "_BlogBodyImages_B_fkey" FOREIGN KEY ("B") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogBodyVideos" ADD CONSTRAINT "_BlogBodyVideos_A_fkey" FOREIGN KEY ("A") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogBodyVideos" ADD CONSTRAINT "_BlogBodyVideos_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
