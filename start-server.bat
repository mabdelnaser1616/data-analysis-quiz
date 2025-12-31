@echo off
chcp 65001 >nul
echo ========================================
echo   تشغيل خادم Heygen API
echo ========================================
echo.
echo جاري تثبيت المكتبات المطلوبة...
call npm install
echo.
echo جاري تشغيل الخادم...
echo.
echo بعد تشغيل الخادم، افتح index.html في المتصفح
echo.
call npm start
pause

