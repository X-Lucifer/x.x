---
title: X.SuperResolution
slug: x-superresolution
summary: 面向 Windows 的本地 AI 图像增强软件，以原生 NCNN/Vulkan 引擎提供批量超分辨率处理。
category: 图像工具
year: 2026
order: 1
status: Released
accent: #79d9c1
stack: [C# / .NET 10, Avalonia 12, C++, NCNN / Vulkan]
featured: true
repo: https://github.com/X-Lucifer/X.SuperResolution
demo: https://github.com/X-Lucifer/X.SuperResolution/releases
demoLabel: 获取发行版
seoTitle: X.SuperResolution — Windows 本地 AI 图片放大与降噪 | X.LUCIFER
seoDescription: X.SuperResolution 是 Windows 本地 AI 图像增强工具，集成 Waifu2x、Real-ESRGAN、SRMD 与 NCNN/Vulkan，支持批量图片放大、降噪、任务管理和 PNG/JPG/WebP 输出。查看功能、运行截图与安装条件。
keywords: [X.SuperResolution, AI 图片放大, 图像超分辨率, 批量图片降噪, Real-ESRGAN, Waifu2x, NCNN Vulkan]
languages: [C#, C++]
platforms: [Windows 10 x64, Windows 11 x64]
appCategory: MultimediaApplication
features: [本地 AI 图像增强, Waifu2x / Real-ESRGAN / SRMD, 批量任务队列, GPU 与分块参数, PNG / JPG / WebP 输出, 中英文与明暗主题]
---

## X.SuperResolution 是什么

X.SuperResolution 是面向 Windows 的本地 AI 图像增强软件，用于图片放大、降噪与细节增强。它将 Avalonia 桌面工作台和 NCNN/Vulkan 原生推理引擎组合在一起，让批量导入、模型选择、处理进度与结果保存形成完整工作流。核心推理在本机执行，不需要上传图片或接入云端 API。

项目适合照片、插画与动漫素材的批量处理，也适合需要明确控制 GPU、分块尺寸和输出目录的本地工作流。具体效果取决于原图质量、模型和参数，增强结果需要结合原图判断。

## 图像处理与参数控制

- **三类推理引擎**：集成 Waifu2x、Real-ESRGAN 和 SRMD，提供 CUNet、照片、动漫及 Real-ESRGAN 系列模型配置。
- **批量图片输入**：支持 PNG、JPG、JPEG、WebP；单张输入上限为 50 MiB，导入后按文件大小组织任务。
- **模型与画质参数**：可选择引擎对应的模型、放大倍率和降噪等级；不同引擎使用各自可用的参数组合。
- **GPU 执行设置**：支持 GPU 选择、Tile Size 分块、加载／推理／保存阶段的并发设置，以及 TTA 测试时增强选项。
- **结果输出**：支持 PNG、JPG、WebP，允许指定输出目录，默认保存到程序目录下的 `output`。

### 批量任务与运行反馈

任务列表呈现每张图片的处理状态、进度与耗时。用户可以启动或停止处理、移除任务、清理队列，并通过运行日志定位模型加载、推理或写入失败。界面把常用增强设置和高级性能参数分开，既能快速开始，也能按显存与吞吐需求细调。

### 桌面体验与设置保存

应用提供浅色／深色主题和简体中文／英文界面。主题、语言和输出目录保存在程序目录的 `settings.json`，下次启动可恢复。整个处理链路围绕本地文件与本地模型运行。

## 运行预览

### 浅色工作台

![X.SuperResolution 浅色工作台：图片任务区、Waifu2x/Real-ESRGAN/SRMD 选择与输出设置](../../previews/x-superresolution/workspace-light.png)

### 深色工作台

![X.SuperResolution 深色工作台：本地图片导入、增强参数与高级性能设置](../../previews/x-superresolution/workspace-dark.png)

## 安装与运行条件

| 项目 | 要求与说明 |
| --- | --- |
| 操作系统 | Windows 10／11 x64 |
| 图形环境 | 支持 Vulkan 的 GPU 与对应驱动 |
| Full 发行包 | 包含 .NET 运行时与模型，适合直接使用 |
| Thin 发行包 | 需要自行安装 .NET 10 x64 运行时，并准备所需模型 |
| 原生依赖 | 发布目录需要保留 `vcomp140.dll` 及相关原生运行文件 |
| 模型文件 | 保持模型目录结构，成对保留 `.param` 与 `.bin` |

从 [发行页面](https://github.com/X-Lucifer/X.SuperResolution/releases) 获取合适的包，完整解压后运行。先添加少量图片，选择引擎、模型和输出位置，确认处理结果后再执行较大批次。

输出文件使用 `{filename}_out.{extension}` 命名。相同输出路径可能被覆盖，处理不同目录中的同名图片时应规划输出目录。

## 工程实现与本地开发

桌面层使用 .NET 10、Avalonia 12 与 MVVM；C# 通过原生桥接调用 C++ 图像处理引擎，NCNN 与 Vulkan 承担推理。原生进度回调回到 UI 线程更新任务状态，界面交互与计算职责分离。

在配置好 .NET 10 SDK、原生依赖与模型后，可在源码目录执行：

```powershell
dotnet restore X.SuperResolution.slnx
dotnet build X.SuperResolution.slnx
dotnet run --project .\X.SuperResolution\X.SuperResolution.csproj --no-build
```

仓库还提供 Full／Thin 发布和 Windows 安装包脚本。完整构建步骤、运行库准备和模型目录约定见 [项目 README](https://github.com/X-Lucifer/X.SuperResolution#readme)。
