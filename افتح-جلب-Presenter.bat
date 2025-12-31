@echo off
chcp 65001 >nul
echo جاري فتح صفحة جلب Presenter ID...
start "" "get-did-presenters.html"
timeout /t 2 >nul
exit

