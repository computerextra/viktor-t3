/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/await-thenable */
import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      return { uploadedBy: metadata.userId, url: file.ufsUrl };
    }),
};

export type OurFileRouter = typeof ourFileRouter;
