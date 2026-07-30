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
---

## 项目概述

X.SuperResolution 是面向 Windows 的本地 AI 图像超分辨率软件。项目将桌面任务管理与原生图像推理引擎组合为完整产品：用户可以批量导入图片、选择算法与模型、调整执行参数，并在本机完成增强、放大与格式转换。模型、输入文件与输出结果均保留在本地，核心处理流程不依赖云端 API。

## 已实现的处理能力

- 集成 **Waifu2x、Real-ESRGAN 与 SRMD** 三类处理引擎
- 内置 CUNet、照片、动漫及 Real-ESRGAN 系列模型配置
- 支持缩放倍率、降噪等级、模型、GPU、Tile Size 与 TTA 参数
- 支持 `PNG`、`JPG`、`WebP` 输出格式
- 可分别配置加载、推理与保存阶段的并发参数
- 提供批量任务队列、逐项进度、耗时统计、运行日志与失败状态
- 支持任务启动、停止、取消、移除和批量清理
- 输出目录与界面语言可持久化保存

任务调度会按文件大小组织待处理项，并将原生引擎回调转换为界面可观察的进度与状态；处理中止时同时向托管任务和原生任务传播取消信号。

## 技术架构

### 桌面应用层

应用基于 **.NET 10、C# 与 Avalonia 12** 构建，采用 CommunityToolkit.Mvvm 管理状态和命令，通过 Microsoft.Extensions.DependencyInjection 组装设置服务与主视图模型。界面层负责文件选择、参数配置、任务队列、日志、国际化和运行状态展示。

### 引擎桥接层

`X.SuperResolution.Engine` 作为独立项目封装原生 `lucifer_ncnn_vulkan` 动态库。托管层通过 P/Invoke 建立任务配置、注册进度回调，并实现初始化引用计数、任务启动、暂停、恢复、取消、状态查询和异步释放，避免原生线程生命周期直接泄漏到 UI 层。

### 原生推理层

实际图像处理由 C++、NCNN 与 Vulkan 执行。模型路径、缩放、降噪、GPU、分块大小以及加载/处理/保存并发数通过结构化任务配置传入原生引擎，在本地 GPU 环境中完成推理。

## 构建与交付

仓库提供两套 Windows x64 发布流程：

- **Full**：自包含单文件构建，包含模型目录与 .NET 运行时
- **Thin**：依赖本机 .NET 运行时，不包含模型目录，适合独立更新程序主体

发布脚本会补齐 Microsoft Visual C++ OpenMP 运行库，并可进一步生成 7z 分发包。NSIS 安装器支持简体中文和英文、当前用户安装、覆盖升级与卸载注册，全程无需管理员权限。

## 运行边界

当前交付目标为 Windows x64，运行环境需要支持 Vulkan 的显卡与最新驱动。模型目录必须遵循仓库约定；Thin 包还需要由使用者单独准备模型文件。详细模型结构与发行文件以项目 README、`FOLDER_STRUCTURE.md` 和 Releases 为准。
