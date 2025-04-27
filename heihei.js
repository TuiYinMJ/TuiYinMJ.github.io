var doc1 = activeDocument;
var folderPath = decodeURI(doc1.path.toString());
doc1.close(SaveOptions.DONOTSAVECHANGES);

var folder = new Folder(folderPath);
var imageFiles = [];
var supportedExtensions = ["*.jpg", "*.jpeg", "*.png"];

alert('嘿嘿');

// 获取所有支持的图片格式
for (var i = 0; i < supportedExtensions.length; i++) {
    var files = folder.getFiles(supportedExtensions[i]);
    imageFiles = imageFiles.concat(files);
}
var flag = 0;

// 定义常量
var FOLDER_TYPES = ["彩页", "小不干胶", "大不干胶"];
var SIZE_TYPES = ["A2", "A3", "A4", "A5"];
var REGEX_FULL =
    /TT-YPAN-|TT-YPan-|TT-CFANG-|TT-CFang-|TT-XIN-|TT-ZFX-|-A3|-A4|-A5|-A2|-BH|-CK/gi;
var REGEX_SIZE = /-A3|-A2|-A4|-A5|-BH|-CK/gi;

for (var k = 0; k < imageFiles.length; k++) {
    try {
        var doc = open(imageFiles[k]);
        var layers = doc.layers;
        var fileName = imageFiles[k].name.replace(/\.[^\.]+$/, "");

        // 创建输出文件夹
        createFolders();

        // 根据文件名确定处理方式
        if (fileName.indexOf("CFang") > -1 || fileName.indexOf("CFANG") > -1) {
            if (folderPath.indexOf("NSZ") > -1 || folderPath.indexOf("nsz") > -1) {
                NCSX();
            } else {
                CFX();
            }
        } else if (fileName.indexOf("YPan") > -1 || fileName.indexOf("YPAN") > -1) {
            YPAN();
        } else if (fileName.indexOf("ZFX") > -1 || fileName.indexOf("zfx") > -1) {
            ZFX();
        } else if (fileName.indexOf("XIN") > -1 || fileName.indexOf("xin") > -1) {
            XIN();
        }
    } catch (e) {
        alert("处理文件时出错: " + e.message);
    }
}

// 创建输出文件夹
function createFolders() {
    for (var i = 0; i < FOLDER_TYPES.length; i++) {
        var subFolder = new Folder(folderPath + "/" + FOLDER_TYPES[i]);
        if (!subFolder.exists) {
            subFolder.create();
        }
    }
}

// 保存PNG文件的通用函数
function savePNG(folderType, baseFileName, sizeSuffix) {
    var pngSaveOptions = new PNGSaveOptions();
    var filePath = folderPath + "/" + folderType + "/" + baseFileName;
    if (sizeSuffix) {
        filePath += sizeSuffix;
    }
    var pngFile = new File(filePath);
    doc.saveAs(pngFile, pngSaveOptions, true, Extension.LOWERCASE);
}

function XIN() {
    var actionSetName = "新彩页不干胶";
    var commonActionSet = "新彩页不干胶";
    var baseFileName = getProcessedFileName("XIN");

    // 处理彩页
    doAction("心形-彩页", actionSetName);
    savePNG("彩页", baseFileName);

    // 处理小不干胶
    doAction("心型-小不干", actionSetName);
    app.refresh(); // 确保替换生效
    processSizes("小不干胶", baseFileName, commonActionSet);

    // 处理大不干胶
    doAction("心型-大不干", actionSetName);
    processSizes("大不干胶", baseFileName, commonActionSet);

    // 关闭文档并恢复历史记录
    doc.close(SaveOptions.DONOTSAVECHANGES);
    doAction("恢复历史", commonActionSet);
}

// 修改替换函数，使用更宽松的匹配
function replaceProductCode(originalFileName) {
    try {
        // 添加延迟和刷新确保文档已加载
        app.refresh();
        $.sleep(100);

        var productCode = originalFileName.match(/TT-[A-Za-z]+-\d+/i);
        if (!productCode) {
            alert("警告：在文件名中未找到有效货号");
            return;
        }

        // 遍历并替换文本
        var found = false;
        for (var i = 0; i < activeDocument.layers.length; i++) {
            var layer = activeDocument.layers[i];
            if (layer.kind === LayerKind.TEXT && layer.name === "替换货号") {
                layer.visible = true; // 确保图层可见
                var textItem = layer.textItem;
                textItem.contents = productCode[0];
                textItem.justification = Justification.CENTER;
                found = true;
                app.refresh(); // 刷新确保更改生效
                break;
            }
        }
        if (!found) {
            alert("错误：替换货号图层不存在");
        }
    } catch (e) {
        alert("替换错误: " + e.message);
    }
}

// 添加新的替换函数处理大不干胶
function replaceProductNumber(originalFileName) {
    try {
        // 提取货号中的数字部分
        var numberMatch = originalFileName.match(/TT-[A-Za-z]+-(\d+)/i);
        if (!numberMatch) {
            alert("警告：在文件名中未找到有效货号数字");
            return;
        }
        var productNumber = numberMatch[1]; // 获取捕获组中的数字部分

        var found = false;
        for (var i = 0; i < activeDocument.layers.length; i++) {
            var layer = activeDocument.layers[i];
            if (
                layer.kind === LayerKind.TEXT &&
                layer.textItem.contents === "12345"
            ) {
                layer.visible = true;
                layer.textItem.contents = productNumber;
                layer.textItem.justification = Justification.CENTER;
                found = true;
                app.refresh();
                break;
            }
        }
        if (!found) {
            alert("错误：未找到包含'12345'的文本图层");
        }
    } catch (e) {
        alert("替换货号数字错误: " + e.message);
    }
}

function processSizes(folderType, baseFileName, actionSetName) {
    if (folderType === "小不干胶") {
        replaceProductCode(fileName);
    } else if (folderType === "大不干胶") {
        replaceProductNumber(fileName);
    }

    for (var i = 0; i < SIZE_TYPES.length; i++) {
        doAction(SIZE_TYPES[i] + "黑点显示", actionSetName);
        savePNG(folderType, baseFileName, "-" + SIZE_TYPES[i]);
        doAction(SIZE_TYPES[i] + "黑点隐藏", actionSetName);
    }
}

// 获取处理后的基础文件名
function getProcessedFileName(prefix) {
    var processedFileName = fileName
        .replace(prefix + "-", prefix + "-M")
        .replace("-A3", "")
        .replace("-A2", "")
        .replace("-A4", "")
        .replace("-A5", "")
        .replace("-BH", "")
        .replace("-CK", "");

    // 处理特殊情况
    if (prefix === "YPAN") {
        processedFileName = processedFileName.replace("YPan-", "YPAN-M");
    } else if (prefix === "CFANG") {
        processedFileName = processedFileName.replace("CFang-", "CFANG-M");
    }

    return processedFileName;
}

// 通用处理流程
function processGeneric(
    prefix,
    actionPrefix,
    actionSetName,
    folderActionSuffix
) {
    // 处理彩页
    doAction(actionPrefix + folderActionSuffix["彩页"], actionSetName);
    var baseFileName = getProcessedFileName(prefix);
    savePNG("彩页", baseFileName);

    // 处理小不干胶
    doAction(actionPrefix + folderActionSuffix["小不干胶"], actionSetName);
    processSizes("小不干胶", baseFileName, actionSetName);

    // 处理大不干胶
    doAction(actionPrefix + folderActionSuffix["大不干胶"], actionSetName);
    processSizes("大不干胶", baseFileName, actionSetName);

    // 关闭文档并恢复历史记录
    doc.close(SaveOptions.DONOTSAVECHANGES);
    doAction("历史记录恢复", actionSetName);
}

function YPAN() {
    var actionSetName = "新彩页不干胶";
    var baseFileName = getProcessedFileName("YPAN");

    // 处理彩页
    doAction("圆形-彩页", actionSetName);
    savePNG("彩页", baseFileName);

    // 处理小不干胶
    doAction("圆形-小不干", actionSetName);
    processSizes("小不干胶", baseFileName, actionSetName);

    // 处理大不干胶
    doAction("圆形-大不干", actionSetName);
    processSizes("大不干胶", baseFileName, actionSetName);

    // 关闭文档并恢复历史记录
    doc.close(SaveOptions.DONOTSAVECHANGES);
    doAction("恢复历史", actionSetName);
}

function ZFX() {
    var actionSetName = "新彩页不干胶";
    var baseFileName = getProcessedFileName("ZFX");

    // 处理彩页
    doAction("正方形-彩页", actionSetName);
    savePNG("彩页", baseFileName);

    // 处理小不干胶
    doAction("正方形-小不干", actionSetName);
    processSizes("小不干胶", baseFileName, actionSetName);

    // 处理大不干胶
    doAction("正方形-大不干", actionSetName);
    processSizes("大不干胶", baseFileName, actionSetName);

    // 关闭文档并恢复历史记录
    doc.close(SaveOptions.DONOTSAVECHANGES);
    doAction("恢复历史", actionSetName);
}

function CFX() {
    var actionSetName = "新彩页不干胶";
    var baseFileName = getProcessedFileName("CFANG");

    // 处理彩页
    doAction("长方形-竖-彩页", actionSetName);
    savePNG("彩页", baseFileName);

    // 处理小不干胶
    doAction("长方形-竖-小不干", actionSetName);
    processSizes("小不干胶", baseFileName, actionSetName);

    // 处理大不干胶
    doAction("长方形-竖-大不干", actionSetName);
    processSizes("大不干胶", baseFileName, actionSetName);

    // 关闭文档并恢复历史记录
    doc.close(SaveOptions.DONOTSAVECHANGES);
    doAction("恢复历史", actionSetName);
}

function NCSX() {
    var actionSetName = "新彩页不干胶";
    var baseFileName = getProcessedFileName("CFANG");

    // 处理彩页
    doAction("长方形-横-彩页", actionSetName);
    savePNG("彩页", baseFileName);

    // 处理小不干胶
    doAction("长方形-横-小不干", actionSetName);
    processSizes("小不干胶", baseFileName, actionSetName);

    // 处理大不干胶
    doAction("长方形-横-大不干", actionSetName);
    processSizes("大不干胶", baseFileName, actionSetName);

    // 关闭文档并恢复历史记录
    doc.close(SaveOptions.DONOTSAVECHANGES);
    doAction("恢复历史", actionSetName);
}
