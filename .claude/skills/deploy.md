# 部署到 GitHub Pages

推送到 `main` 分支後，GitHub Actions 會自動執行測試、打包並部署。

## 執行步驟
1. 執行 `npm run test:run` 確認測試通過
2. 執行 `npm run build` 確認打包成功
3. commit 並 push 到 `main` 分支
4. GitHub Actions 自動觸發部署（約 1-2 分鐘）

## 部署網址
https://cls-wang.github.io/minecraft-pixel-art-generator/

## 手動觸發
至 GitHub repo → Actions → Deploy to GitHub Pages → Run workflow
