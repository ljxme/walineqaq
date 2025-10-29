const fs = require("fs");
const path = require("path");

const imageExtensions = [".png", ".gif", ".webp"];
const excludeFolders = [".git", ".github", "node_modules"];

fs.readdirSync("./", { withFileTypes: true })
  .filter((item) => item.isDirectory() && !excludeFolders.includes(item.name))
  .forEach((folder) => {
    const folderName = folder.name;
    const folderPath = path.resolve(__dirname, folderName);
    const infoPath = path.join(folderPath, "info.json");

    // 如果 info.json 文件已经存在，跳过当前文件夹
    if (fs.existsSync(infoPath)) {
      console.log(`⚠️ 跳过文件夹 ${folderName}：info.json 文件已存在`);
      return;  // 跳过当前循环，继续处理下一个文件夹
    }

    // 获取文件夹下的所有图片文件
    const images = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .filter(
        (item) =>
          item.isFile() && imageExtensions.includes(path.extname(item.name))
      )
      .map((item) => item.name);

    if (images.length === 0) {
      console.warn(`⚠️  跳过文件夹 ${folderName}：没有找到图片文件`);
      return;
    }

    // 自动检测文件类型（假设所有图片类型相同）
    const type = path.extname(images[0]).replace(".", "");

    // 自动检测前缀：取第一个文件名前半部分作为前缀（直到第一个“-”）
    const prefixMatch = images[0].match(/^(.*?)-/);
    const prefix = prefixMatch ? prefixMatch[1] + "-" : "";

    // 提取图片文件名中的表情项
    const items = images.map((item) =>
      item
        .replace(new RegExp(`^${prefix}`), "")
        .replace(new RegExp(`\.${type}$`), "")
    );

    // 构造 info.json 内容
    const info = {
      name: folderName,
      prefix: prefix,
      type: type,
      icon: items[0],
      items: items,
    };

    // 写入 info.json 文件
    fs.writeFileSync(infoPath, JSON.stringify(info, null, 2), "utf-8");
    console.log(`✅ 已生成: ${path.relative(__dirname, infoPath)}`);
  });

console.log("🎉 所有 info.json 已生成完成！");