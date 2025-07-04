import { mkdir, readdir, writeFile } from "fs/promises";
import { type NextRequest, NextResponse } from "next/server";
import path from "path";

const handler = async (req: NextRequest) => {
  const formData = await req.formData();
  const uploadPath = path.join(process.cwd() + "/public", "/images");

  try {
    await readdir(uploadPath);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    await mkdir(uploadPath);
  }
  const f = formData.get("image");

  if (!f) {
    return NextResponse.json({}, { status: 400 });
  }

  const file = f as File;
  const fileArrayBuffer = await file.arrayBuffer();

  await writeFile(
    path.join(uploadPath, file.name),
    Buffer.from(fileArrayBuffer),
  );

  return NextResponse.json({
    fileName: file.name,
    path: path.join(uploadPath, file.name),
    size: file.size,
    lastModified: new Date(file.lastModified),
  });
};

export { handler as POST };
