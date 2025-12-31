@echo off
chcp 65001 >nul
echo جاري فتح صفحة اختبار APIs...
start "" "test-did-elevenlabs.html"
timeout /t 2 >nul
exit

